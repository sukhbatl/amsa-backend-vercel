'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('PostsTags', {
      fields: ['PostId', 'TagId'],
      type: 'unique',
      name: 'unique-post-tags'
    }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('PostsTags', 'unique-post-tags');
  }
};
