'use strict';
module.exports = (sequelize, DataTypes) => {
  const PostsTags = sequelize.define('PostsTags', {
    PostId: DataTypes.INTEGER,
    TagId: DataTypes.INTEGER
  }, {});
  PostsTags.associate = function(models) {
    PostsTags.belongsTo(models.Post);
    PostsTags.belongsTo(models.Tag);
  };
  return PostsTags;
};
