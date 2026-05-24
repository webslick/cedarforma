'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CedarTelegramSubscribers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      chatId: { type: Sequelize.STRING, allowNull: false, unique: true },
      username: { type: Sequelize.STRING, allowNull: true },
      firstName: { type: Sequelize.STRING, allowNull: true },
      lastName: { type: Sequelize.STRING, allowNull: true },
      role: { type: Sequelize.ENUM('owner', 'manager'), allowNull: false, defaultValue: 'manager' },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      lastCommandAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CedarTelegramSubscribers');
  },
};
