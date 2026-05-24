'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminUser extends Model {}

  AdminUser.init({
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('owner', 'admin', 'manager'), defaultValue: 'admin' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    sequelize,
    modelName: 'AdminUser',
    tableName: 'CedarAdminUsers',
  });

  return AdminUser;
};
