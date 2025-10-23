"use strict";
module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define("Topic", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    sub_topic_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    parent_thumbnail: { type: DataTypes.BLOB("long"), allowNull: false }
  }, { tableName: "Topic", timestamps: false });

  Topic.associate = (models) => {
    Topic.belongsTo(models.Topic, { as: "subTopic", foreignKey: "sub_topic_id" });
    Topic.hasMany(models.Post, { foreignKey: "topic_id" });
  };
  return Topic;
};