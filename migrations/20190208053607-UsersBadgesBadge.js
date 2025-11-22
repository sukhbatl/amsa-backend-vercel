'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'UsersBadges', // name of Source model
            'BadgeId', // name of the key we're adding
            {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Badges', // name of Target model
                    key: 'id', // key in Target model that we're referencing
                },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            'UsersBadges', // name of Source model
            'BadgeId' // key we want to remove
        );
    }
};
