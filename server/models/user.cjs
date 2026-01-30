'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Record, { foreignKey: 'userId', as: 'records' });
      User.hasMany(models.MealItem, { foreignKey: 'userId', as: 'mealItems' });
      User.hasMany(models.ChatHistory, { foreignKey: 'userId', as: 'chatHistories' });
      User.hasMany(models.HealthyInfo, { foreignKey: 'userId', as: 'healthyInfos' });
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    tel: {
      type: DataTypes.STRING,
      validate: {
        isNumeric: true,
        len: [10, 15]
      }
    },
    nickName: DataTypes.STRING,
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0 for user, 1 for admin, etc.
      validate: {
        isInt: true
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
