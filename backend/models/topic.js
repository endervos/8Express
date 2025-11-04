"use strict";
module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define("Topic", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false }
  }, { tableName: "Topic", timestamps: false });

  Topic.associate = (models) => {
    Topic.hasMany(models.Post, { foreignKey: "topic_id" });
  };
  return Topic;
};