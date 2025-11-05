const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Comment } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;
    const { post_id, body, parent_id } = req.body;
    if (!token)
      return res.status(401).json({ success: false, message: "Thiếu token đăng nhập." });
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ success: false, message: "Token không hợp lệ." });
    }
    if (!post_id || !body) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc." });
    }
    const userIdField = decoded.role === "admin" ? null : decoded.id;
    const adminIdField = decoded.role === "admin" ? decoded.id : null;
    const newComment = await Comment.create({
      post_id,
      user_id: userIdField,
      admin_id: adminIdField,
      body,
      parent_id: parent_id || null,
      created_at: new Date(),
    });
    res.json({ success: true, data: newComment });
  } catch (err) {
    console.error("Lỗi thêm comment:", err);
    res.status(500).json({ success: false, message: "Không thể thêm bình luận" });
  }
});

module.exports = router;