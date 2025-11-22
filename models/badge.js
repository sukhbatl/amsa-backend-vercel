'use strict';
module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define('Badge', {
    name: DataTypes.STRING,
    picUrl: DataTypes.STRING,
    description: DataTypes.STRING,
    title: DataTypes.STRING,
  }, {});
  Badge.associate = function(models) {
    Badge.hasMany(models.UsersBadges);
  };
  return Badge;
};
