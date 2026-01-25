'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Records', {
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
      currentCarbs: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      currentProtein: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      currentFat: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      currentCalories: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      targetCarbs: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      targetProtein: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      targetFat: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      targetCalories: {
        allowNull: true,
        type: Sequelize.INTEGER
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

    // 添加联合唯一索引，确保同一用户同一天只有一条汇总记录
    await queryInterface.addIndex('Records', ['userId', 'date'], {
      unique: true,
      name: 'unique_user_date_record'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Records');
  }
};