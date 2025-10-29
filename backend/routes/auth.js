const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const { User } = require("../models");
const { sendVerificationEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET;
const otpStore = new Map();


router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu email" });

    const code = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, { code, expiresAt: dayjs().add(5, "minute") });

    await sendVerificationEmail(email, code);
    res.json({ success: true, message: "Mã xác thực đã được gửi." });
  } catch (err) {
    console.error("Lỗi gửi OTP:", err);
    res
      .status(500)
      .json({ success: false, message: "Không thể gửi mã xác thực." });
  }
});


router.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;
  const record = otpStore.get(email);

  if (!record)
    return res
      .status(400)
      .json({ success: false, message: "Không có mã nào được gửi." });
  if (dayjs().isAfter(record.expiresAt))
    return res
      .status(400)
      .json({ success: false, message: "Mã đã hết hạn." });
  if (String(record.code) !== String(code))
    return res
      .status(400)
      .json({ success: false, message: "Mã không chính xác." });

  otpStore.delete(email);
  res.json({ success: true, message: "Xác thực thành công!" });
});


router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      birthYear,
      birthMonth,
      birthDay,
      gender,
    } = req.body;
    const date_of_birth = `${birthYear}-${birthMonth}-${birthDay}`;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      full_name: fullName,
      email,
      password: hashedPassword,
      phone,
      gender,
      date_of_birth,
    });

    res.json({
      success: true,
      message: "Đăng ký thành công!",
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res
      .status(400)
      .json({ success: false, message: error.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu sai!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu sai!" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const avatarBase64 =
      user.avatar && Buffer.isBuffer(user.avatar)
        ? user.avatar.toString("base64")
        : null;

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        avatar: avatarBase64,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server." });
  }
});

module.exports = router;