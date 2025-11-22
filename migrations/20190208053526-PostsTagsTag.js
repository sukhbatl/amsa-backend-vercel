'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'PostsTags', // name of Source model
            'TagId', // name of the key we're adding
            {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Tags', // name of Target model
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
            'PostsTags', // name of Source model
            'TagId' // key we want to remove
        );
    }
};
