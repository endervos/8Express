"use strict";
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    topic_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.BLOB("long"), allowNull: true },
    audio: { type: DataTypes.BLOB("long"), allowNull: true },
    video: { type: DataTypes.BLOB("long"), allowNull: true },
    like_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    haha_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    love_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    sad_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    wow_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    angry_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Hidden", "Banned"),
      defaultValue: "Pending"
    },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
  }, {
    tableName: "Post",
    timestamps: false,
    validate: {
      nonEmptyTitle() {
        if (!this.title || !this.title.trim()) throw new Error("title không được rỗng");
      },
      atLeastOneContent() {
        if (!this.body && !this.image && !this.audio && !this.video) {
          throw new Error("Bài viết phải có ít nhất body hoặc 1 media");
        }
      }
    }
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: "user_id" });
    Post.belongsTo(models.Admin, { foreignKey: "admin_id" });
    Post.belongsTo(models.Topic, { foreignKey: "topic_id" });
    Post.hasMany(models.Share, { foreignKey: "post_id" });
    Post.hasMany(models.Comment, { foreignKey: "post_id" });
    Post.hasMany(models.PostReaction, { foreignKey: "post_id" });
  };
  return Post;
};