'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    static associate(models) {
      Lead.hasMany(models.LeadEvent, { foreignKey: 'leadId', as: 'events', onDelete: 'CASCADE' });
    }
  }

  Lead.init({
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    service: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    budget: { type: DataTypes.STRING, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    managerNote: { type: DataTypes.TEXT, allowNull: true },
    nextContactAt: { type: DataTypes.DATE, allowNull: true },
    assignedManagerChatId: { type: DataTypes.STRING, allowNull: true },
    assignedManagerName: { type: DataTypes.STRING, allowNull: true },
    closedAt: { type: DataTypes.DATE, allowNull: true },
    source: { type: DataTypes.STRING, allowNull: true, defaultValue: 'site' },
    status: {
      type: DataTypes.ENUM('new', 'in_work', 'measurement', 'estimate', 'done', 'cancelled'),
      allowNull: false,
      defaultValue: 'new',
    },
  }, {
    sequelize,
    modelName: 'Lead',
    tableName: 'CedarLeads',
  });

  return Lead;
};
