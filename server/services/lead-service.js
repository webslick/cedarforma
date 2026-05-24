const { Op } = require('sequelize');

const { Lead, CedarLeadPhoto } = require('../db/models');

const telegramService = require('./telegram-service');
const leadEventService = require('./lead-event-service');
const reminderService = require('./reminder-service');
function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

const allowedStatuses = ['new', 'in_work', 'measurement', 'estimate', 'done', 'cancelled'];

class LeadService {
  validate(data) {
    const errors = {};
    const phone = onlyDigits(data.phone);

    if (!data.name || data.name.trim().length < 2) errors.name = 'Укажите имя';
    if (!phone || phone.length < 10) errors.phone = 'Укажите корректный телефон';

    return { errors, phone };
  }

async createLead(data, options = {}) {
    const { errors, phone } = this.validate(data);
    if (Object.keys(errors).length) {
      const error = new Error('VALIDATION_ERROR');
      error.status = 400;
      error.errors = errors;
      throw error;
    }

    const lead = await Lead.create({
      name: data.name.trim(),
      phone,
      email: data.email ? data.email.trim().toLowerCase() : null,
      service: data.service || null,
      address: data.address || null,
      budget: data.budget || null,
      message: data.message || null,
      managerNote: data.managerNote || null,
      source: data.source || 'site',
      status: 'new',
    });

    await leadEventService.create({
      leadId: lead.id,
      type: 'created',
      newStatus: lead.status,
      source: 'site',
      actorName: 'Сайт',
      comment: 'Заявка создана с сайта',
    });

if (!options?.skipTelegram) {
  try {
    const telegramResult = await telegramService.sendLeadNotification(lead);

    console.log(
      '[LeadService] Telegram notification result:',
      telegramResult
    );
  } catch (error) {
    console.error(
      '[LeadService] Telegram notification fatal error:',
      error.response?.data || error.message
    );
  }
}

    return lead;
  }

  async getAllLeads(query = {}) {
    const where = {};
    const status = query.status;
    const search = String(query.search || '').trim();

    if (status && allowedStatuses.includes(status)) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${onlyDigits(search) || search}%` } },
        { service: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const leads = await Lead.findAll({ where, order: [['createdAt', 'DESC']] });
    const prepared = leads.map((lead) => {
      const json = lead.toJSON();
      const reason = reminderService.getAttentionReason(lead);
      json.requiresAttention = Boolean(reason);
      json.attentionReason = reason;
      return json;
    });

    if (query.attention === 'true') {
      return prepared.filter((lead) => lead.requiresAttention);
    }

    return prepared;
  }

  async getLeadEvents(id) {
    const lead = await Lead.findByPk(id);
    if (!lead) {
      const error = new Error('Заявка не найдена');
      error.status = 404;
      throw error;
    }

    return leadEventService.getByLeadId(id);
  }

  async updateLead(id, data, actor = {}) {
    const lead = await Lead.findByPk(id);
    if (!lead) {
      const error = new Error('Заявка не найдена');
      error.status = 404;
      throw error;
    }

    const oldStatus = lead.status;
    const patch = {};
    ['status', 'managerNote', 'nextContactAt', 'service', 'address', 'budget', 'message'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field)) patch[field] = data[field] || null;
    });

    if (patch.status && !allowedStatuses.includes(patch.status)) {
      const error = new Error('Некорректный статус');
      error.status = 400;
      throw error;
    }

    await lead.update(patch);
    await lead.reload();

    const newStatus = lead.status;
    const actorName = actor.name || 'Админка';
    const actorChatId = actor.chatId || null;
    const source = actor.source || 'admin';

    if (patch.status && oldStatus !== newStatus) {
      await leadEventService.create({
        leadId: lead.id,
        type: 'status_changed',
        oldStatus,
        newStatus,
        actorName,
        actorChatId,
        source,
        comment: leadEventService.statusComment(oldStatus, newStatus, actorName),
      });
    } else {
      await leadEventService.create({
        leadId: lead.id,
        type: 'updated',
        oldStatus,
        newStatus,
        actorName,
        actorChatId,
        source,
        comment: `${actorName}: обновил данные заявки`,
        payload: Object.keys(patch),
      });
    }

    return lead;
  }

  async updateLeadStatus(id, status, actor = {}) {
    return this.updateLead(id, { status }, actor);
  }

async getLeadByIdWithPhotos(id) {
  return Lead.findByPk(id, {
    include: [
      {
        model: CedarLeadPhoto,
        as: 'photos',
      },
    ],
  });
}

async sendLeadTelegramNotification(lead) {
  try {
    const result = await telegramService.sendLeadNotification(lead);
    console.log('[LeadService] Telegram notification result:', result);
    return result;
  } catch (error) {
    console.error('[LeadService] Telegram notification failed:', error.response?.data || error.message);
    return {
      ok: false,
      error: error.response?.data || error.message,
    };
  }
}


  async deleteLead(id, actor = {}) {
    const lead = await Lead.findByPk(id);
    if (!lead) {
      const error = new Error('Заявка не найдена');
      error.status = 404;
      throw error;
    }

    await leadEventService.create({
      leadId: lead.id,
      type: 'deleted',
      oldStatus: lead.status,
      source: actor.source || 'admin',
      actorName: actor.name || 'Админка',
      comment: `${actor.name || 'Админка'}: удалил заявку`,
    });

    await lead.destroy();
    return true;
  }
}

module.exports = new LeadService();
