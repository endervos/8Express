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
      user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
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
    Share.belongsTo(models.User, { foreignKey: "user_id" });
    Share.belongsTo(models.Admin, { foreignKey: "admin_id" });
  };
  return Share;
};