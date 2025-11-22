'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(191),
        allowNull: false
      },
      birthday: {
        type: Sequelize.DATE,
        allowNull: false
      },
      address1: {
        type: Sequelize.STRING(191),
        allowNull: false
      },
      address2: {
        type: Sequelize.STRING(191)
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      zipCode: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING(40)
      },
      personalEmail: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      facebook: {
        type: Sequelize.STRING(191)
      },
      linkedin: {
        type: Sequelize.STRING(191)
      },
      instagram: {
        type: Sequelize.STRING(191)
      },
      acceptanceStatus: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      degreeLevel: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      schoolYear: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      graduationYear: {
        type: Sequelize.STRING(4),
        allowNull: false
      },
      major: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      major2: {
        type: Sequelize.STRING(40)
      },
      schoolName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      schoolState: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      schoolCity: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      hash: {
        type: Sequelize.STRING(191),
        allowNull: false
      },
      emailVerified: {
        type: Sequelize.TINYINT,
        allowNull: false,
        default: 0
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0
      },
      bio: {
        type: Sequelize.TEXT,
      },
      profilePic: {
        type: Sequelize.STRING(191),
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
    return queryInterface.dropTable('Users');
  }
};
