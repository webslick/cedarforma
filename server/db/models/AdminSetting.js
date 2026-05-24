'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminSetting extends Model {}

  AdminSetting.init({
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'string' },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'AdminSetting',
    tableName: 'CedarAdminSettings',
  });

  return AdminSetting;
};
