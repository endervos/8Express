"use strict";
require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(to, code) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: "Mã xác thực đăng ký tài khoản 8Express",
      html: `
        <div style="font-family:sans-serif;line-height:1.5;">
          <h2>Xin chào,</h2>
          <p>Mã xác thực của bạn là:</p>
          <h1 style="letter-spacing:6px;font-size:32px;color:#6b21a8;">${code}</h1>
          <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
          <hr/>
          <small>© 2025 8Express Team</small>
        </div>
      `,
    });
    console.log("Gửi mail thành công:", info.messageId);
    return true;
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    return false;
  }
}

module.exports = { sendVerificationEmail };