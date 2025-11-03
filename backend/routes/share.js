"use strict";
const express = require("express");
const router = express.Router();
const { Share, Post, User, Topic } = require("../models");


router.post("/", async (req, res) => {
  try {
    const { post_id, user_id } = req.body;
    if (!post_id || !user_id)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu post_id hoặc user_id" });

    const post = await Post.findByPk(post_id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Bài viết không tồn tại" });

    if (post.status !== "Approved")
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể chia sẻ bài viết đã được duyệt",
      });

    const user = await User.findByPk(user_id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });

    const existed = await Share.findOne({ where: { post_id, shared_by: user_id } });
    if (existed)
      return res.json({
        success: true,
        message: "Bài viết này bạn đã chia sẻ trước đó.",
      });

    await Share.create({ post_id, shared_by: user_id, shared_at: new Date() });

    res.json({ success: true, message: "Chia sẻ bài viết thành công" });
  } catch (err) {
    console.error("Lỗi chia sẻ:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi chia sẻ bài viết" });
  }
});


router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const shares = await Share.findAll({
      where: { shared_by: userId },
      include: [
        {
          model: Post,
          include: [
            { model: User, attributes: ["id", "full_name", "avatar"] },
            { model: Topic, attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["shared_at", "DESC"]],
    });

    const result = shares.map((s) => {
      const p = s.Post;
      return {
        id: p.id,
        title: p.title,
        body: p.body,
        category: p.Topic?.name || "Chưa phân loại",
        author: p.User?.full_name || "Không rõ",
        authorAvatar: p.User?.avatar
          ? `data:image/jpeg;base64,${Buffer.from(p.User.avatar).toString("base64")}`
          : null,
        image: p.image
          ? `data:image/jpeg;base64,${Buffer.from(p.image).toString("base64")}`
          : null,
        audio: p.audio
          ? `data:audio/mp3;base64,${Buffer.from(p.audio).toString("base64")}`
          : null,
        video: p.video
          ? `data:video/mp4;base64,${Buffer.from(p.video).toString("base64")}`
          : null,
        status: p.status,
        publishedAt: p.created_at,
        sharedAt: s.shared_at,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Lỗi lấy danh sách chia sẻ:", err);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách bài viết chia sẻ",
    });
  }
});

module.exports = router;