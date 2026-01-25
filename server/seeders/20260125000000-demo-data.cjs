'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create Users
    const users = await queryInterface.bulkInsert('Users', [
      {
        username: 'testuser',
        password: 'password123', // In a real app, this should be hashed
        email: 'test@example.com',
        tel: '13800138000',
        nickName: 'Test User',
        role: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        password: 'adminpassword',
        email: 'admin@example.com',
        tel: '13900139000',
        nickName: 'Admin User',
        role: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: ['id'] });

    // Fetch the ID of the user we just inserted/found
    const [fetchedUsers] = await queryInterface.sequelize.query(
      "SELECT id FROM Users WHERE username = 'testuser';"
    );
    
    if (!fetchedUsers || fetchedUsers.length === 0) {
      throw new Error('Failed to find created user ID');
    }
    
    const userId = fetchedUsers[0].id;

    // 2. Create Records for testuser
    await queryInterface.bulkInsert('Records', [
      {
        userId: userId,
        date: new Date().toISOString().split('T')[0], // Today
        currentCarbs: 150,
        currentProtein: 80,
        currentFat: 50,
        currentCalories: 1500,
        targetCarbs: 250,
        targetProtein: 120,
        targetFat: 70,
        targetCalories: 2200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: userId,
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], // Yesterday
        currentCarbs: 200,
        currentProtein: 100,
        currentFat: 60,
        currentCalories: 1800,
        targetCarbs: 250,
        targetProtein: 120,
        targetFat: 70,
        targetCalories: 2200,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // 3. Create MealItems for testuser
    await queryInterface.bulkInsert('MealItems', [
      {
        userId: userId,
        date: new Date().toISOString().split('T')[0],
        mealType: 'Breakfast',
        foodName: 'Oatmeal with Berries',
        calories: 350,
        imgUrl: 'https://example.com/oatmeal.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: userId,
        date: new Date().toISOString().split('T')[0],
        mealType: 'Lunch',
        foodName: 'Grilled Chicken Salad',
        calories: 550,
        imgUrl: 'https://example.com/salad.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: userId,
        date: new Date().toISOString().split('T')[0],
        mealType: 'Dinner',
        foodName: 'Salmon and Quinoa',
        calories: 600,
        imgUrl: 'https://example.com/salmon.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // 4. Create ChatHistories for testuser
    await queryInterface.bulkInsert('ChatHistories', [
      {
        sessionId: 'session-001',
        userId: userId,
        role: 'user',
        content: 'I want to lose weight.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sessionId: 'session-001',
        userId: userId,
        role: 'assistant',
        content: 'I can help with that! What is your current activity level?',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ChatHistories', null, {});
    await queryInterface.bulkDelete('MealItems', null, {});
    await queryInterface.bulkDelete('Records', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
