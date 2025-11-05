const express = require("express");
const router = express.Router();
const { Post, Topic } = require("../models");

router.get("/", async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: [
        {
          model: Post,
          where: { status: "Approved" },
          required: false,
        },
      ],
    });
    const data = topics.map((t) => ({
      id: t.id,
      name: t.name,
      icon: "book",
      postCount: t.Posts ? t.Posts.length : 0,
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi lấy chủ đề:", err);
    res.status(500).json({ success: false, message: "Không thể lấy chủ đề." });
  }
});

module.exports = router;