'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [packages] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS count FROM `paket`'
    );

    if (Number(packages[0].count) === 0) {
      await queryInterface.bulkInsert('paket', [
        {
          jenis_paket: 'Cuci Setrika',
          harga: 20000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          jenis_paket: 'Cuci',
          harga: 10000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          jenis_paket: 'Setrika',
          harga: 10000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('paket', {
      jenis_paket: ['Cuci Setrika', 'Cuci', 'Setrika']
    });
  }
};
