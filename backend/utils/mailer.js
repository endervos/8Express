"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "99fb1b001@smtp-brevo.com",
    pass: "bsknWODfU1PQeej",
  },
});

async function sendVerificationEmail(to, code) {
  const info = await transporter.sendMail({
    from: '"8Express" <no-reply@8express.com>',
    to,
    subject: "Mã xác thực tài khoản 8Express",
    html: `
      <div style="font-family:sans-serif;line-height:1.5;">
        <h2>Xin chào,</h2>
        <p>Mã xác thực của bạn là:</p>
        <h1 style="letter-spacing:6px;font-size:32px;">${code}</h1>
        <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
        <hr/>
        <small>© 2025 8Express Team</small>
      </div>
    `,
  });
  console.log("Gửi mail thành công:", info.messageId);
}

module.exports = { sendVerificationEmail };