"use strict";
module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define("Reaction", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    icon: { type: DataTypes.BLOB("long"), allowNull: false }
  }, { tableName: "Reaction", timestamps: false });

  Reaction.associate = (models) => {
    Reaction.hasMany(models.PostReaction, { foreignKey: "reaction_id" });
  };
  return Reaction;
};