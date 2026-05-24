'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CedarLeadPhotos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      leadId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CedarLeads',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      originalName: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      mimeType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CedarLeadPhotos');
  },
};