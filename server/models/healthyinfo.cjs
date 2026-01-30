'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HealthyInfo extends Model {
    static associate(models) {
      HealthyInfo.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  HealthyInfo.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1
      }
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
        max: 300
      }
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
        max: 500
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
        max: 150
      }
    },
    sex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        isIn: [[1, 2]]
      }
    },
    bodyStatus: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    sequelize,
    modelName: 'HealthyInfo',
  });
  return HealthyInfo;
};

