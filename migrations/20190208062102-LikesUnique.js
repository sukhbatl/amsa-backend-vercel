'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('Likes', {
      fields: ['UserId', 'PostId'],
      type: 'unique',
      name: 'unique-like'
    }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('Likes', 'unique-like');
  }
};
