'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CedarLeadPhoto extends Model {
    static associate(models) {
      CedarLeadPhoto.belongsTo(models.Lead, {
        foreignKey: 'leadId',
        as: 'lead',
      });
    }
  }

  CedarLeadPhoto.init(
    {
      leadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'CedarLeadPhoto',
      tableName: 'CedarLeadPhotos',
    }
  );

  return CedarLeadPhoto;
};