"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Comment", {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      post_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
      user_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
      body: { type: S.TEXT, allowNull: false },
      parent_id: { type: S.INTEGER.UNSIGNED, allowNull: true },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal("CURRENT_TIMESTAMP") }
    }, { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" });

    await q.addConstraint("Comment", {
      fields: ["post_id"], type: "foreign key", name: "fk_comment_post",
      references: { table: "Post", field: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE"
    });
    await q.addConstraint("Comment", {
      fields: ["user_id"], type: "foreign key", name: "fk_comment_user",
      references: { table: "User", field: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE"
    });
    await q.addConstraint("Comment", {
      fields: ["parent_id"], type: "foreign key", name: "fk_comment_parent",
      references: { table: "Comment", field: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE"
    });

    await q.addIndex("Comment", ["post_id"]);
    await q.addIndex("Comment", ["parent_id"]);
  },
  async down(q) { await q.dropTable("Comment"); }
};