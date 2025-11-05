"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable(
      "Share",
      {
        id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        post_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
        user_id: { type: S.INTEGER.UNSIGNED, allowNull: true },
        admin_id: { type: S.INTEGER.UNSIGNED, allowNull: true },
        shared_at: {
          type: S.DATE,
          allowNull: false,
          defaultValue: S.literal("CURRENT_TIMESTAMP"),
        },
      },
      { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" }
    );
    await q.addConstraint("Share", {
      fields: ["post_id"],
      type: "foreign key",
      name: "fk_share_post",
      references: { table: "Post", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await q.addConstraint("Share", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_share_user",
      references: { table: "User", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await q.addConstraint("Share", {
      fields: ["admin_id"],
      type: "foreign key",
      name: "fk_share_admin",
      references: { table: "Admin", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await q.addIndex("Share", ["post_id"]);
    await q.addIndex("Share", ["user_id"]);
    await q.addIndex("Share", ["admin_id"]);
  },
  async down(q) {
    await q.dropTable("Share");
  },
};