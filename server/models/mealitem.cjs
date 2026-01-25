'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MealItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MealItem.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  MealItem.init({
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    },
    date: {
      allowNull: false,
      type: DataTypes.DATEONLY,
      validate: {
        isDate: true
      }
    },
    mealType: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        isIn: [['Breakfast', 'Lunch', 'Dinner', 'Snack']]
      }
    },
    foodName: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    calories: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    imgUrl: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    }
  }, {
    sequelize,
    modelName: 'MealItem',
  });
  return MealItem;
};