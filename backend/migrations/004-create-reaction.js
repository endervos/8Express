"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Reaction", {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: S.STRING(50), allowNull: false },
      icon: { type: S.BLOB("long"), allowNull: false }
    }, { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" });
  },
  async down(q) { await q.dropTable("Reaction"); }
};