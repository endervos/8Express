"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable(
      "Admin",
      {
        id: {
          type: S.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        phone: {
          type: S.STRING(10),
          allowNull: false,
        },
        email: {
          type: S.STRING(100),
          allowNull: false,
        },
        password: {
          type: S.STRING(255),
          allowNull: false,
        },
        full_name: {
          type: S.STRING(100),
          allowNull: false,
        },
        gender: {
          type: S.ENUM("Nam", "Nữ", "Khác"),
          allowNull: false,
        },
        date_of_birth: {
          type: S.DATEONLY,
          allowNull: false,
        },
        avatar: {
          type: S.BLOB("long"),
          allowNull: true,
        },
        created_at: {
          type: S.DATE,
          defaultValue: S.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: S.DATE,
          defaultValue: S.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );
    await q.addConstraint("Admin", {
      fields: ["phone"],
      type: "check",
      where: S.literal("CHAR_LENGTH(phone)=10 AND phone REGEXP '^[0-9]{10}$'"),
      name: "chk_admin_phone_10digits",
    });
    await q.addConstraint("Admin", {
      fields: ["email"],
      type: "check",
      where: S.literal(
        "email REGEXP '^[^@]+@[^@]+\\\\.[a-z]{2,}(\\\\.[a-z]{2,})?$'"
      ),
      name: "chk_admin_email_format",
    });
    await q.addConstraint("Admin", {
      fields: ["password"],
      type: "check",
      where: S.literal("CHAR_LENGTH(password) >= 8"),
      name: "chk_admin_password_min8",
    });
    await q.addConstraint("Admin", {
      fields: ["full_name"],
      type: "check",
      where: S.literal("CHAR_LENGTH(full_name) >= 2"),
      name: "chk_admin_fullname_len",
    });
  },
  async down(q) {
    await q.dropTable("Admin");
  },
};