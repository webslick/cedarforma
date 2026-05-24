const { Op } = require('sequelize');
const { Lead, LeadEvent } = require('../db/models');
const telegramService = require('./telegram-service');
const leadEventService = require('./lead-event-service');

function minutes(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function hours(value, fallback) {
  return minutes(value, fallback * 60) * 60 * 1000;
}

function msFromMinutes(value, fallback) {
  return minutes(value, fallback) * 60 * 1000;
}

const statusLabels = {
  new: 'Новая',
  in_work: 'В работе',
  measurement: 'Замер',
  estimate: 'Смета',
  done: 'Завершена',
  cancelled: 'Отказ',
};

class ReminderService {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    this.intervalMs = msFromMinutes(process.env.LEAD_REMINDER_CHECK_MINUTES, 10);
    this.newLeadMs = msFromMinutes(process.env.LEAD_REMINDER_NEW_MINUTES, 30);
    this.inWorkMs = hours(process.env.LEAD_REMINDER_IN_WORK_HOURS, 24);
    this.measurementMs = hours(process.env.LEAD_REMINDER_MEASUREMENT_HOURS, 48);
    this.cooldownMs = msFromMinutes(process.env.LEAD_REMINDER_COOLDOWN_MINUTES, 120);
  }

  getAgeMs(lead) {
    const base = lead.updatedAt || lead.createdAt || new Date();
    return Date.now() - new Date(base).getTime();
  }

  getAttentionReason(lead) {
    if (!lead || ['done', 'cancelled'].includes(lead.status)) return null;

    if (lead.nextContactAt && new Date(lead.nextContactAt).getTime() <= Date.now()) {
      return {
        key: 'next_contact_overdue',
        title: '📌 Просрочен следующий контакт',
        text: `по заявке #${lead.id} наступило время следующего контакта`,
      };
    }

    const ageMs = this.getAgeMs(lead);

    if (lead.status === 'new' && ageMs >= this.newLeadMs) {
      return {
        key: 'new_without_reaction',
        title: '⚠️ Новая заявка без реакции',
        text: `заявка #${lead.id} больше ${Math.round(this.newLeadMs / 60000)} минут не взята в работу`,
      };
    }

    if (lead.status === 'in_work' && ageMs >= this.inWorkMs) {
      return {
        key: 'in_work_stale',
        title: '⏰ Заявка зависла в работе',
        text: `по заявке #${lead.id} давно не было движения`,
      };
    }

    if (lead.status === 'measurement' && ageMs >= this.measurementMs) {
      return {
        key: 'measurement_without_estimate',
        title: '📐 Замер без сметы',
        text: `после замера по заявке #${lead.id} пора подготовить смету`,
      };
    }

    return null;
  }

  async wasRecentlyReminded(leadId, key) {
    const since = new Date(Date.now() - this.cooldownMs);
    const event = await LeadEvent.findOne({
      where: {
        leadId,
        type: 'reminder',
        comment: { [Op.like]: `%[${key}]%` },
        createdAt: { [Op.gte]: since },
      },
      order: [['createdAt', 'DESC']],
    });

    return Boolean(event);
  }

  async checkOnce() {
    const leads = await Lead.findAll({
      where: {
        status: { [Op.notIn]: ['done', 'cancelled'] },
      },
      order: [['updatedAt', 'ASC']],
      limit: 100,
    });

    let sent = 0;

    for (const lead of leads) {
      const reason = this.getAttentionReason(lead);
      if (!reason) continue;

      const alreadySent = await this.wasRecentlyReminded(lead.id, reason.key);
      if (alreadySent) continue;

      await telegramService.sendLeadReminder(lead, reason).catch((error) => {
        console.error(`[Reminder] Telegram reminder failed for lead #${lead.id}:`, error.message);
      });

      await leadEventService.create({
        leadId: lead.id,
        type: 'reminder',
        oldStatus: lead.status,
        newStatus: lead.status,
        actorName: 'Система',
        source: 'system',
        comment: `[${reason.key}] ${reason.title}: ${reason.text}`,
        payload: reason,
      });

      sent += 1;
    }

    if (sent > 0) {
      console.log(`[Reminder] sent reminders: ${sent}`);
    }

    return sent;
  }

  start() {
    if (this.timer) return;

    console.log(`[Reminder] started. interval=${Math.round(this.intervalMs / 60000)} min`);

    setTimeout(() => {
      this.checkOnce().catch((error) => console.error('[Reminder] first check error:', error.message));
    }, 20000);

    this.timer = setInterval(async () => {
      if (this.isRunning) return;
      this.isRunning = true;

      try {
        await this.checkOnce();
      } catch (error) {
        console.error('[Reminder] check error:', error.message);
      } finally {
        this.isRunning = false;
      }
    }, this.intervalMs);
  }
}

module.exports = new ReminderService();
