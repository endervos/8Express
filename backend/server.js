"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

// ===== Kết nối MySQL =====
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    timezone: "+07:00",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true,
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false,
    },
  }
);

// ===== Khởi tạo Model =====
const User = UserModel(sequelize, Sequelize.DataTypes);

sequelize
  .authenticate()
  .then(() => console.log("Kết nối MySQL thành công"))
  .catch((err) => console.error("Lỗi kết nối MySQL:", err));

sequelize
  .sync()
  .then(() => console.log("Sequelize đã sync bảng User"))
  .catch((err) => console.error("Lỗi sync DB:", err));

// ===== Cấu hình SMTP từ .env =====
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ===== OTP tạm thời =====
const otpStore = new Map();

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Server 8Express hoạt động");
});


app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

    const code = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = dayjs().add(5, "minute");
    otpStore.set(email, { code, expiresAt });

    await transporter.sendMail({
      from: '"8Express" <8expressnhom5@gmail.com>',
      to: email,
      subject: "Mã xác thực 8Express của bạn",
      html: `
        <div style="font-family:sans-serif;line-height:1.5;">
          <h2>Xin chào!</h2>
          <p>Mã xác thực của bạn là:</p>
          <h1 style="letter-spacing:6px;font-size:32px;color:#6b21a8;">${code}</h1>
          <p>Mã có hiệu lực 5 phút.</p>
        </div>
      `,
    });

    console.log(`Đã gửi mã xác thực ${code} tới ${email}`);
    res.json({ success: true, message: "Mã xác thực đã được gửi tới email." });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({ success: false, message: "Không thể gửi mã xác thực." });
  }
});


app.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;
  const record = otpStore.get(email);

  if (!record)
    return res.status(400).json({ success: false, message: "Không có mã nào được gửi" });
  if (dayjs().isAfter(record.expiresAt))
    return res.status(400).json({ success: false, message: "Mã đã hết hạn" });
  if (String(record.code) !== String(code))
    return res.status(400).json({ success: false, message: "Mã không chính xác" });

  otpStore.delete(email);
  res.json({ success: true, message: "Xác thực thành công" });
});


app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phone, birthYear, birthMonth, birthDay, gender } = req.body;
    const date_of_birth = `${birthYear}-${birthMonth}-${birthDay}`;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name: fullName,
      email,
      password: hashedPassword,
      phone,
      gender,
      date_of_birth,
    });

    res.json({ success: true, message: "Đăng ký thành công!", user: newUser });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu sai!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu sai!" });

    // Sinh JWT token hiệu lực 7 ngày
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});


app.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
});


app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});