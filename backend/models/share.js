"use strict";

module.exports = (sequelize, DataTypes) => {
  const Share = sequelize.define(
    "Share",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      post_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      shared_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      shared_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: "Share", timestamps: false }
  );

  Share.associate = (models) => {
    Share.belongsTo(models.Post, { foreignKey: "post_id" });
    Share.belongsTo(models.User, { foreignKey: "shared_by" });
  };

  return Share;
};