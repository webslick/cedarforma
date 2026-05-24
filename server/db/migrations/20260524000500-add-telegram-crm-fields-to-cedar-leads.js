'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CedarLeads', 'assignedManagerChatId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('CedarLeads', 'assignedManagerName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('CedarLeads', 'closedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('CedarLeads', 'closedAt');
    await queryInterface.removeColumn('CedarLeads', 'assignedManagerName');
    await queryInterface.removeColumn('CedarLeads', 'assignedManagerChatId');
  },
};
