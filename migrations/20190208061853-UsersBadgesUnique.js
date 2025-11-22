'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('UsersBadges', {
      fields: ['UserId', 'BadgeId'],
      type: 'unique',
      name: 'unique-users-badge'
    }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('UsersBadges', 'unique-users-badge');
  }
};
