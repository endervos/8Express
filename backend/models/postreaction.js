"use strict";
module.exports = (sequelize, DataTypes) => {
  const PostReaction = sequelize.define("PostReaction", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    post_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    reaction_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    reacted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: "PostReaction", timestamps: false });

  PostReaction.associate = (models) => {
    PostReaction.belongsTo(models.Post, { foreignKey: "post_id" });
    PostReaction.belongsTo(models.User, { foreignKey: "user_id" });
    PostReaction.belongsTo(models.Reaction, { foreignKey: "reaction_id" });
  };
  return PostReaction;
};