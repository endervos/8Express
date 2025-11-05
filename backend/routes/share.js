"use strict";
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Share, Post, User, Admin, Topic } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "Thiếu token đăng nhập." });
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ success: false, message: "Token không hợp lệ." });
    }
    const { post_id } = req.body;
    if (!post_id)
      return res.status(400).json({ success: false, message: "Thiếu post_id" });
    const post = await Post.findByPk(post_id);
    if (!post)
      return res.status(404).json({ success: false, message: "Bài viết không tồn tại" });
    if (post.status !== "Approved")
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể chia sẻ bài viết đã được duyệt",
      });
    const userId = decoded.role === "user" ? decoded.id : null;
    const adminId = decoded.role === "admin" ? decoded.id : null;
    const existed = await Share.findOne({
      where: { post_id, user_id: userId, admin_id: adminId },
    });
    if (existed)
      return res.json({
        success: true,
        message: "Bài viết này đã được chia sẻ trước đó.",
      });
    await Share.create({
      post_id,
      user_id: userId,
      admin_id: adminId,
      shared_at: new Date(),
    });
    res.json({ success: true, message: "Chia sẻ bài viết thành công" });
  } catch (err) {
    console.error("Lỗi chia sẻ:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi chia sẻ bài viết",
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.query;
    const where =
      role === "admin" ? { admin_id: id } : { user_id: id };
    const shares = await Share.findAll({
      where,
      include: [
        {
          model: Post,
          include: [
            { model: User, attributes: ["id", "full_name", "avatar"] },
            { model: Admin, attributes: ["id", "full_name", "avatar"] },
            { model: Topic, attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["shared_at", "DESC"]],
    });
    const result = shares.map((s) => {
      const p = s.Post;
      const isAdminPost = p?.admin_id && !p?.user_id;
      const author = isAdminPost
        ? (p.Admin?.full_name || "Ẩn danh (Admin)")
        : (p.User?.full_name || "Ẩn danh (User)");
      const authorAvatar = isAdminPost
        ? (p.Admin?.avatar
          ? `data:image/jpeg;base64,${Buffer.from(p.Admin.avatar).toString("base64")}`
          : null)
        : (p.User?.avatar
          ? `data:image/jpeg;base64,${Buffer.from(p.User.avatar).toString("base64")}`
          : null);
      return {
        id: p.id,
        title: p.title,
        body: p.body,
        category: p.Topic?.name || "Chưa phân loại",
        author,
        authorAvatar,
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