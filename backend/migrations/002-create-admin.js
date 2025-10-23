"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Admin", {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      phone: { type: S.STRING(10), allowNull: false },
      email: { type: S.STRING(100), allowNull: false },
      full_name: { type: S.STRING(100), allowNull: false },
      gender: { type: S.ENUM("Nam","Nữ","Khác"), allowNull: false },
      date_of_birth: { type: S.DATEONLY, allowNull: false },
      country: { type: S.STRING(100), allowNull: false },
      city: { type: S.STRING(100), allowNull: false }
    }, { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" });

    await q.addConstraint("Admin", { fields: ["phone"], type: "check", where: S.literal("CHAR_LENGTH(phone)=10 AND phone REGEXP '^[0-9]{10}$'"), name: "chk_admin_phone_10digits" });
    await q.addConstraint("Admin", { fields: ["email"], type: "check", where: S.literal("email LIKE '%@%.com'"), name: "chk_admin_email_com" });
    await q.addConstraint("Admin", { fields: ["full_name"], type: "check", where: S.literal("CHAR_LENGTH(full_name) >= 2"), name: "chk_admin_fullname_len" });
  },
  async down(q) { await q.dropTable("Admin"); }
};