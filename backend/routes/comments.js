const express = require("express");
const router = express.Router();
const { Comment } = require("../models");

router.post("/", async (req, res) => {
  try {
    const { post_id, user_id, body, parent_id } = req.body;

    if (!post_id || !user_id || !body) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
    }

    const newComment = await Comment.create({
      post_id,
      user_id,
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