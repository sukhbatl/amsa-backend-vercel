'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: DataTypes.STRING,
    role: DataTypes.STRING,
    year: DataTypes.INTEGER,
    yearEnd: DataTypes.INTEGER,
  }, {});
  Role.associate = function(models) {
    Role.belongsTo(models.User);
  };
  return Role;
};
