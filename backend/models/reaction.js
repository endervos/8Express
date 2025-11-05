"use strict";

module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define("Reaction", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    icon: { type: DataTypes.STRING(10), allowNull: false, },
  }, { tableName: "Reaction", timestamps: false, charset: "utf8mb4", collate: "utf8mb4_unicode_ci", });
  Reaction.associate = (models) => {
    Reaction.hasMany(models.PostReaction, { foreignKey: "reaction_id", as: "postReactions", });
  };
  return Reaction;
};