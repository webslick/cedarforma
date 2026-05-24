'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('CedarLeadEvents', 'type', {
      type: Sequelize.ENUM('created', 'status_changed', 'updated', 'deleted', 'telegram_action', 'reminder'),
      allowNull: false,
      defaultValue: 'updated',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('CedarLeadEvents', 'type', {
      type: Sequelize.ENUM('created', 'status_changed', 'updated', 'deleted', 'telegram_action'),
      allowNull: false,
      defaultValue: 'updated',
    });
  },
};
