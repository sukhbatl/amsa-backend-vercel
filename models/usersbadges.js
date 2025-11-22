'use strict';
module.exports = (sequelize, DataTypes) => {
  const UsersBadges = sequelize.define('UsersBadges', {
    UserId: DataTypes.INTEGER,
    BadgeId: DataTypes.INTEGER
  }, {});
  UsersBadges.associate = function(models) {
    UsersBadges.belongsTo(models.User);
    UsersBadges.belongsTo(models.Badge);
  };
  return UsersBadges;
};
