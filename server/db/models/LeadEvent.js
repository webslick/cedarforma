'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LeadEvent extends Model {
    static associate(models) {
      LeadEvent.belongsTo(models.Lead, { foreignKey: 'leadId', as: 'lead' });
    }
  }

  LeadEvent.init({
    leadId: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM('created', 'status_changed', 'updated', 'deleted', 'telegram_action', 'reminder'),
      allowNull: false,
      defaultValue: 'updated',
    },
    oldStatus: { type: DataTypes.STRING, allowNull: true },
    newStatus: { type: DataTypes.STRING, allowNull: true },
    actorName: { type: DataTypes.STRING, allowNull: true },
    actorChatId: { type: DataTypes.STRING, allowNull: true },
    source: {
      type: DataTypes.ENUM('site', 'admin', 'telegram', 'system'),
      allowNull: false,
      defaultValue: 'system',
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
    payload: { type: DataTypes.JSON, allowNull: true },
  }, {
    sequelize,
    modelName: 'LeadEvent',
    tableName: 'CedarLeadEvents',
  });

  return LeadEvent;
};
