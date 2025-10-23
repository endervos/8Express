"use strict";
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    post_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    parent_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: "Comment", timestamps: false });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Post, { foreignKey: "post_id" });
    Comment.belongsTo(models.User, { foreignKey: "user_id" });
    Comment.belongsTo(models.Comment, { as: "parent", foreignKey: "parent_id" });
    Comment.hasMany(models.Comment, { as: "children", foreignKey: "parent_id" });
  };
  return Comment;
};