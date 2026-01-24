'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ChatHistories', [
      {
        sessionId: 'session-001',
        role: 'user',
        content: '你好，你是谁？',
        createdAt: new Date(),
      },
      {
        sessionId: 'session-001',
        role: 'assistant',
        content: '你好！我是你的 AI 营养顾问，有什么可以帮你的吗？',
        createdAt: new Date(),
      },
      {
        sessionId: 'session-002',
        role: 'user',
        content: '苹果有什么营养？',
        createdAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ChatHistories', null, {});
  }
};
