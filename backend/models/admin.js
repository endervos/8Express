"use strict";
const dayjs = require("dayjs");
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define("Admin", {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    phone: { type: DataTypes.STRING(10), allowNull: false, validate: { is: /^\d{10}$/ } },
    email: { type: DataTypes.STRING(100), allowNull: false, validate: { is: /\S@.+\.com$/i } },
    full_name: { type: DataTypes.STRING(100), allowNull: false, validate: { len: [2,100] } },
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
    country: { type: DataTypes.STRING(100), allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false }
  }, { tableName: "Admin", timestamps: false });

  Admin.associate = (models) => {
    Admin.hasMany(models.Post, { foreignKey: "admin_id" });
  };
  return Admin;
};