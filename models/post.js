'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: DataTypes.STRING,
    picUrl: DataTypes.STRING,
    subTitle: DataTypes.STRING,
    content: DataTypes.TEXT,
    type: DataTypes.STRING,
    category: DataTypes.STRING,
    tags: DataTypes.STRING,
  }, {});
  Post.associate = function(models) {
    Post.belongsTo(models.User);
    Post.hasMany(models.Like);
    Post.hasMany(models.Comment);
    Post.hasMany(models.PostsTags);
  };
  return Post;
};
