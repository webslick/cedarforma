'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash('admin12345', 7);

    await queryInterface.bulkInsert('CedarAdminUsers', [
      {
        login: 'admin',
        email: 'admin@cedarforma.ru',
        password,
        name: 'Главный админ',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('CedarAdminUsers', {
      login: 'admin',
    });
  },
};