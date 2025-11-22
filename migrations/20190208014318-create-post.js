'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(191)
      },
      picUrl: {
        type: Sequelize.STRING(191)
      },
      subTitle: {
        type: Sequelize.STRING(191)
      },
      content: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.STRING(30)
      },
      category: {
        type: Sequelize.STRING(30)
      },
      tags: {
        type: Sequelize.STRING(191)
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Posts');
  }
};
