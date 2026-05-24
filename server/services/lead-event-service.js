const { LeadEvent } = require('../db/models');

const statusLabels = {
  new: 'Новая',
  in_work: 'В работе',
  measurement: 'Замер',
  estimate: 'Смета',
  done: 'Завершена',
  cancelled: 'Отказ',
};

function getStatusLabel(status) {
  return statusLabels[status] || status || '—';
}

class LeadEventService {
  async create({ leadId, type = 'updated', oldStatus = null, newStatus = null, actorName = null, actorChatId = null, source = 'system', comment = null, payload = null }) {
    if (!leadId) return null;

    return LeadEvent.create({
      leadId,
      type,
      oldStatus,
      newStatus,
      actorName,
      actorChatId,
      source,
      comment,
      payload,
    });
  }

  async getByLeadId(leadId) {
    return LeadEvent.findAll({
      where: { leadId },
      order: [['createdAt', 'DESC']],
    });
  }

  statusComment(oldStatus, newStatus, actorName = 'Система') {
    return `${actorName}: статус изменён с «${getStatusLabel(oldStatus)}» на «${getStatusLabel(newStatus)}»`;
  }
}

module.exports = new LeadEventService();
module.exports.getStatusLabel = getStatusLabel;
