'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Record extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Record.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Record.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    currentCarbs: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    currentProtein: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    currentFat: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    currentCalories: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    targetCarbs: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    targetProtein: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    targetFat: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    targetCalories: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Record',
  });
  return Record;
};