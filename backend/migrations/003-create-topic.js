"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Topic", {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: S.STRING(255), allowNull: false },
      sub_topic_id: { type: S.INTEGER.UNSIGNED, allowNull: true },
      parent_thumbnail: { type: S.BLOB("long"), allowNull: false }
    }, { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" });

    await q.addConstraint("Topic", {
      fields: ["sub_topic_id"],
      type: "foreign key",
      name: "fk_topic_subtopic",
      references: { table: "Topic", field: "id" },
      onDelete: "SET NULL", onUpdate: "CASCADE"
    });
  },
  async down(q) { await q.dropTable("Topic"); }
};