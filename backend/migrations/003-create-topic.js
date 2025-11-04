"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Topic", {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: S.STRING(255), allowNull: false }
    }, {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci"
    });
  },

  async down(q) {
    await q.dropTable("Topic");
  }
};