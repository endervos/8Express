"use strict";
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    phone: {
      type: DataTypes.STRING(10), allowNull: false,
      validate: { is: /^\d{10}$/ }
    },
    email: {
      type: DataTypes.STRING(100), allowNull: false,
      validate: { is: /\S@.+\.com$/i }
    },
    full_name: {
      type: DataTypes.STRING(100), allowNull: false,
      validate: { len: [2, 100] }
    },
    gender: { type: DataTypes.ENUM("Nam","Nữ","Khác"), allowNull: false },
    date_of_birth: {
      type: DataTypes.DATEONLY, allowNull: false,
      validate: {
        isPastAnd14(value){
          const d = dayjs(value);
          if (!d.isValid()) throw new Error("Ngày sinh không hợp lệ");
          if (!d.isBefore(dayjs(), "day")) throw new Error("DOB phải ở quá khứ");
          if (dayjs().diff(d, "year") < 14) throw new Error("Tối thiểu 14 tuổi");
        }
      }
    },
    city: { type: DataTypes.STRING(100), allowNull: false },
    is_banned: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { tableName: "User", timestamps: false });

  User.associate = (models) => {
    User.hasMany(models.Post, { foreignKey: "user_id" });
    User.hasMany(models.Share, { foreignKey: "shared_by" });
    User.hasMany(models.Comment, { foreignKey: "user_id" });
    User.hasMany(models.PostReaction, { foreignKey: "user_id" });
  };
  return User;
};