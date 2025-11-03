"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Post", {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
      admin_id: { type: S.INTEGER.UNSIGNED, allowNull: true },
      topic_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
      title: { type: S.STRING(255), allowNull: false },
      body: { type: S.TEXT, allowNull: true },
      image: { type: S.BLOB("long"), allowNull: true },
      audio: { type: S.BLOB("long"), allowNull: true },
      video: { type: S.BLOB("long"), allowNull: true },
      like_count: { type: S.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      haha_count: { type: S.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      love_count: { type: S.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      sad_count: { type: S.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      wow_count: { type: S.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      angry_count: { type: S.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      status: {
        type: S.ENUM("Pending", "Approved", "Hidden", "Banned"),
        allowNull: false,
        defaultValue: "Pending"
      },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: S.DATE, allowNull: true, defaultValue: S.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
    }, { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" });

    await q.addConstraint("Post", {
      fields: ["user_id"], type: "foreign key", name: "fk_post_user",
      references: { table: "User", field: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE"
    });
    await q.addConstraint("Post", {
      fields: ["admin_id"], type: "foreign key", name: "fk_post_admin",
      references: { table: "Admin", field: "id" }, onDelete: "SET NULL", onUpdate: "CASCADE"
    });
    await q.addConstraint("Post", {
      fields: ["topic_id"], type: "foreign key", name: "fk_post_topic",
      references: { table: "Topic", field: "id" }, onDelete: "RESTRICT", onUpdate: "CASCADE"
    });

    await q.addConstraint("Post", { fields: ["title"], type: "check", where: S.literal("title <> ''"), name: "chk_post_title_non_empty" });
    await q.addConstraint("Post", {
      fields: ["body", "image", "audio", "video"],
      type: "check",
      where: S.literal("(body IS NOT NULL OR image IS NOT NULL OR audio IS NOT NULL OR video IS NOT NULL)"),
      name: "chk_post_has_body_or_media"
    });

    await q.addIndex("Post", ["topic_id"]);
    await q.addIndex("Post", ["user_id"]);
  },
  async down(q) { await q.dropTable("Post"); }
};