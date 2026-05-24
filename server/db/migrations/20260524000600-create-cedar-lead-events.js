'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CedarLeadEvents', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      leadId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'CedarLeads', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('created', 'status_changed', 'updated', 'deleted', 'telegram_action'),
        allowNull: false,
        defaultValue: 'updated',
      },
      oldStatus: { type: Sequelize.STRING, allowNull: true },
      newStatus: { type: Sequelize.STRING, allowNull: true },
      actorName: { type: Sequelize.STRING, allowNull: true },
      actorChatId: { type: Sequelize.STRING, allowNull: true },
      source: { type: Sequelize.ENUM('site', 'admin', 'telegram', 'system'), allowNull: false, defaultValue: 'system' },
      comment: { type: Sequelize.TEXT, allowNull: true },
      payload: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('CedarLeadEvents', ['leadId']);
    await queryInterface.addIndex('CedarLeadEvents', ['type']);
    await queryInterface.addIndex('CedarLeadEvents', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CedarLeadEvents');
  },
};
