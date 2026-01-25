'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MealItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      mealType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      foodName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      calories: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      imgUrl: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 添加联合唯一索引，确保同一用户同一天同一餐只能有一条记录
    await queryInterface.addIndex('MealItems', ['userId', 'date', 'mealType'], {
      unique: true,
      name: 'unique_user_date_meal_type'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MealItems');
  }
};