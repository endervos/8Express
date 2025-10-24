"use strict";
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          notNull: { msg: "Số điện thoại là bắt buộc" },
          is: {
            args: /^[0-9]{10}$/,
            msg: "Số điện thoại phải có đúng 10 chữ số",
          },
        },
      },

      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "Email là bắt buộc" },
          is: {
            args: /^[^@]+@[^@]+\.[a-z]{2,}(\.[a-z]{2,})?$/i,
            msg: "Định dạng email không hợp lệ",
          },
        },
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: { msg: "Mật khẩu là bắt buộc" },
          len: {
            args: [8, 255],
            msg: "Mật khẩu phải có ít nhất 8 ký tự",
          },
        },
      },

      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "Họ tên là bắt buộc" },
          len: {
            args: [2, 100],
            msg: "Họ tên phải có ít nhất 2 ký tự",
          },
        },
      },

      gender: {
        type: DataTypes.ENUM("Nam", "Nữ", "Khác"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["Nam", "Nữ", "Khác"]],
            msg: "Giới tính không hợp lệ",
          },
        },
      },

      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isPastAnd16(value) {
            const d = dayjs(value);
            if (!d.isValid()) throw new Error("Ngày sinh không hợp lệ");
            if (!d.isBefore(dayjs(), "day"))
              throw new Error("Ngày sinh phải ở trong quá khứ");
            const age = dayjs().diff(d, "year");
            if (age < 16) throw new Error("Người dùng phải đủ 16 tuổi trở lên");
          },
        },
      },

      is_banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "User",
      timestamps: false,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Post, { foreignKey: "user_id" });
    User.hasMany(models.Share, { foreignKey: "shared_by" });
    User.hasMany(models.Comment, { foreignKey: "user_id" });
    User.hasMany(models.PostReaction, { foreignKey: "user_id" });
  };

  return User;
};