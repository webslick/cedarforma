const https = require('https');
const { TelegramSubscriber, Lead } = require('../db/models');
const leadEventService = require('./lead-event-service');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

function managerNameFromChat(chat = {}) {
  return [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username || `chat_${chat.id}`;
}

function requestJson(url, payload = null) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : null;
    const req = https.request(url, {
      method: payload ? 'POST' : 'GET',
      headers: payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      } : {},
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { return resolve(JSON.parse(data)); } catch (_) { return resolve(data); }
        }
        reject(new Error(`Telegram error ${res.statusCode}: ${data}`));
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

class TelegramService {
  constructor() {
    this.offset = 0;
    this.timer = null;
    this.isPolling = false;
  }

  get token() {
    return process.env.TELEGRAM_BOT_TOKEN;
  }

  get joinPassword() {
    return process.env.TELEGRAM_JOIN_PASSWORD || process.env.TELEGRAM_MANAGER_PASSWORD;
  }

  isEnabled() {
    return Boolean(this.token);
  }

  getStaticChatIds() {
    return String(process.env.TELEGRAM_CHAT_ID || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  async callTelegram(method, payload) {
    if (!this.isEnabled()) return null;
    const url = `https://api.telegram.org/bot${this.token}/${method}`;
    return requestJson(url, payload);
  }

  async sendMessage(chatId, text, options = {}) {
    if (!this.isEnabled() || !chatId) {
      console.log('[Telegram] send skipped: token or chatId is empty');
      return false;
    }

    await this.callTelegram('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options,
    });

    return true;
  }

  async editMessageText(chatId, messageId, text, options = {}) {
    if (!this.isEnabled() || !chatId || !messageId) return false;

    await this.callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options,
    });

    return true;
  }

  async answerCallback(callbackQueryId, text = '', showAlert = false) {
    if (!callbackQueryId) return;
    await this.callTelegram('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    }).catch(() => {});
  }

  async getRecipientChatIds() {
    const staticIds = this.getStaticChatIds();
    const subscribers = await TelegramSubscriber.findAll({ where: { isActive: true } });
    const dynamicIds = subscribers.map((item) => String(item.chatId));
    return [...new Set([...staticIds, ...dynamicIds])];
  }

  getStatusLabel(status) {
    const statusMap = {
      new: 'Новая',
      in_work: 'В работе',
      measurement: 'Замер',
      estimate: 'Смета',
      done: 'Завершена',
      cancelled: 'Отказ',
    };

    return statusMap[status] || status || 'Новая';
  }

  getLeadText(lead, title = '🌲 <b>Новая заявка CedarForma</b>', lastAction = '') {
    return [
      title,
      '',
      `#${lead.id} · Статус: <b>${this.getStatusLabel(lead.status)}</b>`,
      lead.assignedManagerName ? `👷 Менеджер: <b>${escapeHtml(lead.assignedManagerName)}</b>` : null,
      lastAction ? `✅ Последнее действие: ${escapeHtml(lastAction)}` : null,
      '',
      `👤 Имя: <b>${escapeHtml(lead.name)}</b>`,
      `📞 Телефон: <code>${escapeHtml(lead.phone)}</code>`,
      lead.service ? `🛠 Услуга: ${escapeHtml(lead.service)}` : null,
      lead.address ? `📍 Адрес: ${escapeHtml(lead.address)}` : null,
      lead.budget ? `💰 Бюджет: ${escapeHtml(lead.budget)}` : null,
      lead.message ? `💬 Комментарий: ${escapeHtml(lead.message)}` : null,
      '',
      `🕒 ${new Date(lead.createdAt || Date.now()).toLocaleString('ru-RU', { timeZone: 'Asia/Novosibirsk' })}`,
    ].filter(Boolean).join('\n');
  }

  getContactKeyboard(lead) {
    const phone = onlyDigits(lead.phone);
    const phoneForWa = phone.startsWith('8') ? `7${phone.slice(1)}` : phone;
    const waText = encodeURIComponent(`Здравствуйте, ${lead.name || ''}! Вы оставляли заявку на сайте CedarForma. Подскажите, когда вам удобно обсудить участок?`);
    const waUrl = phoneForWa ? `https://wa.me/${phoneForWa}?text=${waText}` : 'https://wa.me/';

    return [
      { text: '📞 Телефон', callback_data: `lead_phone:${lead.id}` },
      { text: '💬 WhatsApp', url: waUrl },
    ];
  }

  getLeadKeyboard(lead) {
    const status = lead.status || 'new';
    const rows = [];

    if (status === 'new') {
      rows.push([
        { text: '✅ Взять в работу', callback_data: `lead:${lead.id}:in_work` },
        { text: '📅 Назначить замер', callback_data: `lead:${lead.id}:measurement` },
      ]);
      rows.push([
        { text: '📐 Смета', callback_data: `lead:${lead.id}:estimate` },
        { text: '🏁 Закрыть', callback_data: `lead:${lead.id}:done` },
      ]);
      rows.push([{ text: '❌ Отказ', callback_data: `lead:${lead.id}:cancelled` }]);
    }

    if (status === 'in_work') {
      rows.push([
        { text: '📅 Назначить замер', callback_data: `lead:${lead.id}:measurement` },
        { text: '📐 Смета', callback_data: `lead:${lead.id}:estimate` },
      ]);
      rows.push([
        { text: '🏁 Закрыть', callback_data: `lead:${lead.id}:done` },
        { text: '❌ Отказ', callback_data: `lead:${lead.id}:cancelled` },
      ]);
    }

    if (status === 'measurement') {
      rows.push([
        { text: '📐 Смета', callback_data: `lead:${lead.id}:estimate` },
        { text: '🏁 Закрыть', callback_data: `lead:${lead.id}:done` },
      ]);
      rows.push([{ text: '❌ Отказ', callback_data: `lead:${lead.id}:cancelled` }]);
    }

    if (status === 'estimate') {
      rows.push([
        { text: '🏁 Закрыть', callback_data: `lead:${lead.id}:done` },
        { text: '❌ Отказ', callback_data: `lead:${lead.id}:cancelled` },
      ]);
    }

    rows.push(this.getContactKeyboard(lead));

    return { inline_keyboard: rows };
  }

  async sendLeadNotification(lead) {
    if (!this.isEnabled()) {
      console.log('[Telegram] notification skipped: TELEGRAM_BOT_TOKEN is empty');
      return { ok: false, sent: 0, errors: ['TELEGRAM_BOT_TOKEN is empty'] };
    }

    const chatIds = await this.getRecipientChatIds();
    console.log(`[Telegram] new lead #${lead.id}. Recipients: ${chatIds.length}`, chatIds);

    if (!chatIds.length) {
      console.log('[Telegram] notification skipped: no active subscribers and TELEGRAM_CHAT_ID is empty');
      return { ok: false, sent: 0, errors: ['No recipients'] };
    }

    let sent = 0;
    const errors = [];

    for (const chatId of chatIds) {
      try {
        await this.sendMessage(chatId, this.getLeadText(lead), {
          reply_markup: this.getLeadKeyboard(lead),
        });
        sent += 1;
        console.log(`[Telegram] lead #${lead.id} sent to ${chatId}`);
      } catch (error) {
        const message = error.response?.data || error.message;
        errors.push({ chatId, message });
        console.error(`[Telegram] lead #${lead.id} send failed to ${chatId}:`, message);
      }
    }

    return { ok: sent > 0, sent, errors };
  }



  async sendLeadReminder(lead, reason) {
    if (!this.isEnabled()) {
      console.log('[Telegram] reminder skipped: TELEGRAM_BOT_TOKEN is empty');
      return { ok: false, sent: 0, errors: ['TELEGRAM_BOT_TOKEN is empty'] };
    }

    const chatIds = await this.getRecipientChatIds();
    console.log(`[Telegram] reminder for lead #${lead.id}. Recipients: ${chatIds.length}`, chatIds);

    if (!chatIds.length) {
      return { ok: false, sent: 0, errors: ['No recipients'] };
    }

    const title = `${reason.title}\n<b>Заявка требует внимания</b>`;
    const lastAction = reason.text;
    let sent = 0;
    const errors = [];

    for (const chatId of chatIds) {
      try {
        await this.sendMessage(chatId, this.getLeadText(lead, title, lastAction), {
          reply_markup: this.getLeadKeyboard(lead),
        });
        sent += 1;
      } catch (error) {
        const message = error.response?.data || error.message;
        errors.push({ chatId, message });
        console.error(`[Telegram] reminder for lead #${lead.id} failed to ${chatId}:`, message);
      }
    }

    return { ok: sent > 0, sent, errors };
  }

  async handlePhoneCallback(callbackQuery) {
    const data = String(callbackQuery.data || '');
    if (!data.startsWith('lead_phone:')) return false;

    const leadId = Number(data.split(':')[1]);
    if (!leadId) {
      await this.answerCallback(callbackQuery.id, 'Некорректная заявка');
      return true;
    }

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      await this.answerCallback(callbackQuery.id, 'Заявка не найдена');
      return true;
    }

    await this.sendMessage(callbackQuery.from.id, `📞 Телефон клиента: <code>${escapeHtml(lead.phone)}</code>`);
    await this.answerCallback(callbackQuery.id, 'Телефон отправлен');
    return true;
  }

  async handleLeadCallback(callbackQuery) {
    const phoneHandled = await this.handlePhoneCallback(callbackQuery);
    if (phoneHandled) return;

    const data = String(callbackQuery.data || '');
    const parts = data.split(':');
    if (parts[0] !== 'lead' || parts.length !== 3) return;

    const leadId = Number(parts[1]);
    const status = parts[2];
    const allowedStatuses = ['in_work', 'measurement', 'estimate', 'done', 'cancelled'];

    if (!leadId || !allowedStatuses.includes(status)) {
      await this.answerCallback(callbackQuery.id, 'Некорректная команда');
      return;
    }

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      await this.answerCallback(callbackQuery.id, 'Заявка не найдена');
      return;
    }

    const previousStatus = lead.status;
    const chat = callbackQuery.from || {};
    const actorName = managerNameFromChat(chat);

    if (previousStatus === status) {
      await this.answerCallback(callbackQuery.id, `Уже стоит статус: ${this.getStatusLabel(status)}`);
      return;
    }

    const patch = { status };
    if (status === 'in_work' || status === 'measurement' || status === 'estimate') {
      patch.assignedManagerChatId = String(chat.id || '');
      patch.assignedManagerName = actorName;
    }
    if (status === 'done' || status === 'cancelled') {
      patch.closedAt = new Date();
      if (!lead.assignedManagerName) {
        patch.assignedManagerChatId = String(chat.id || '');
        patch.assignedManagerName = actorName;
      }
    }

    await lead.update(patch);
    await lead.reload();

    await leadEventService.create({
      leadId: lead.id,
      type: 'telegram_action',
      oldStatus: previousStatus,
      newStatus: status,
      actorName,
      actorChatId: String(chat.id || ''),
      source: 'telegram',
      comment: leadEventService.statusComment(previousStatus, status, actorName),
    });

    const actionMap = {
      in_work: 'взял заявку в работу',
      measurement: 'перевёл заявку на замер',
      estimate: 'перевёл заявку в смету',
      done: 'закрыл заявку',
      cancelled: 'отметил отказ',
    };

    const lastAction = `${actorName} ${actionMap[status] || 'обновил заявку'}`;
    const title = status === 'done' || status === 'cancelled'
      ? `🏁 <b>Заявка #${lead.id} обработана</b>`
      : `🔔 <b>Заявка #${lead.id} обновлена</b>`;

    const message = callbackQuery.message;
    if (message && message.chat && message.message_id) {
      try {
        await this.editMessageText(message.chat.id, message.message_id, this.getLeadText(lead, title, lastAction), {
          reply_markup: this.getLeadKeyboard(lead),
        });
      } catch (error) {
        console.error('Telegram edit message error:', error.message);
        await this.sendMessage(message.chat.id, this.getLeadText(lead, title, lastAction), {
          reply_markup: this.getLeadKeyboard(lead),
        });
      }
    }

    await this.answerCallback(callbackQuery.id, `Статус: ${this.getStatusLabel(status)}`);
  }

  async handleMessage(message) {
    const chat = message.chat || {};
    const text = String(message.text || '').trim();
    const chatId = String(chat.id || '');
    if (!chatId || !text) return;

    if (text === '/start') {
      await this.sendMessage(chatId, '🌲 CedarForma бот активен. Для подключения менеджера отправьте: <code>/join ПАРОЛЬ</code>');
      return;
    }

    if (text.startsWith('/join')) {
      const password = text.split(/\s+/)[1];
      if (!this.joinPassword) {
        await this.sendMessage(chatId, '⚠️ На сервере не задан TELEGRAM_JOIN_PASSWORD. Админ опять оставил дверь без ручки.');
        return;
      }

      if (password !== this.joinPassword) {
        await this.sendMessage(chatId, '⛔ Неверный пароль подключения.');
        return;
      }

      await TelegramSubscriber.upsert({
        chatId,
        username: chat.username || null,
        firstName: chat.first_name || null,
        lastName: chat.last_name || null,
        role: 'manager',
        isActive: true,
        lastCommandAt: new Date(),
      });

      await this.sendMessage(chatId, '✅ Готово. Теперь сюда будут приходить новые заявки CedarForma с кнопками управления.');
      return;
    }

    if (text === '/stop') {
      await TelegramSubscriber.update({ isActive: false, lastCommandAt: new Date() }, { where: { chatId } });
      await this.sendMessage(chatId, '🔕 Уведомления отключены.');
    }
  }

  async pollOnce() {
    if (!this.isEnabled()) return;
    const url = `https://api.telegram.org/bot${this.token}/getUpdates?timeout=10&offset=${this.offset}`;
    const data = await requestJson(url);
    if (!data || !data.ok || !Array.isArray(data.result)) return;

    for (const update of data.result) {
      this.offset = update.update_id + 1;
      if (update.message) {
        await this.handleMessage(update.message).catch((error) => {
          console.error('Telegram handle message error:', error.message);
        });
      }
      if (update.callback_query) {
        await this.handleLeadCallback(update.callback_query).catch((error) => {
          console.error('Telegram callback error:', error.message);
        });
      }
    }
  }

  startPolling() {
    if (!this.isEnabled()) {
      console.log('Telegram bot disabled: TELEGRAM_BOT_TOKEN is empty');
      return;
    }
    if (this.timer) return;

    console.log('Telegram bot polling started');
    this.timer = setInterval(async () => {
      if (this.isPolling) return;
      this.isPolling = true;
      try {
        await this.pollOnce();
      } catch (error) {
        console.error('Telegram polling error:', error.message);
      } finally {
        this.isPolling = false;
      }
    }, 4000);
  }
}

module.exports = new TelegramService();
