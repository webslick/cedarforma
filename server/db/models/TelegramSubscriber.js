'use strict';

module.exports = (sequelize, DataTypes) => {
  const TelegramSubscriber = sequelize.define('TelegramSubscriber', {
    chatId: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: true },
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('owner', 'manager'), allowNull: false, defaultValue: 'manager' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    lastCommandAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'CedarTelegramSubscribers',
  });

  return TelegramSubscriber;
};
