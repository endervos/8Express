const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const { Sequelize, Post, User, Topic, Reaction, sequelize } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;


router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status.toLowerCase() !== "all") {
      where.status = status.trim();
    }

    const posts = await Post.findAll({
      where,
      include: [
        { model: User, attributes: ["full_name"] },
        { model: Topic, attributes: ["name"] },
      ],
      order: [["created_at", "DESC"]],
    });

    const reactions = await Reaction.findAll({ attributes: ["id", "name", "icon"] });
    const reactionMap = Object.fromEntries(reactions.map(r => [r.name.toLowerCase(), r.icon]));
    const toDataUrl = (buf, mime) =>
      buf && Buffer.isBuffer(buf)
        ? `data:${mime};base64,${buf.toString("base64")}`
        : null;

    const data = await Promise.all(
      posts.map(async (p) => {
        const [commentCount] = await sequelize.query(
          "SELECT COUNT(*) AS c FROM Comment WHERE post_id = ?",
          { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
        );

        const [shareCount] = await sequelize.query(
          "SELECT COUNT(*) AS c FROM Share WHERE post_id = ?",
          { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
        );

        return {
          id: p.id,
          user_id: p.user_id,
          title: p.title,
          excerpt: p.body ? p.body.slice(0, 200) + "..." : "",
          author: p.User?.full_name || "Ẩn danh",
          category: p.Topic?.name || "Chưa phân loại",
          image: toDataUrl(p.image, "image/jpeg"),
          video: toDataUrl(p.video, "video/mp4"),
          audio: toDataUrl(p.audio, "audio/mpeg"),

          reactions: [
            { icon: reactionMap.like || "👍", count: p.like_count },
            { icon: reactionMap.love || "❤️", count: p.love_count },
            { icon: reactionMap.haha || "😆", count: p.haha_count },
            { icon: reactionMap.wow || "😮", count: p.wow_count },
            { icon: reactionMap.sad || "😢", count: p.sad_count },
            { icon: reactionMap.angry || "😡", count: p.angry_count },
          ],
          total_reactions:
            (p.like_count || 0) +
            (p.love_count || 0) +
            (p.haha_count || 0) +
            (p.wow_count || 0) +
            (p.sad_count || 0) +
            (p.angry_count || 0),
          comments: commentCount.c,
          shareCount: shareCount.c,
          publishedAt: p.created_at,
          status: p.status,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi lấy bài viết:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy bài viết." });
  }
});


router.post("/create", async (req, res) => {
  try {
    const { token } = req.headers;
    const { title, topic, content, image, video, audio } = req.body;

    if (!title || !topic || !content) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu bài viết." });
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Thiếu token đăng nhập." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ success: false, message: "Token không hợp lệ." });
    }
    const topicRecord = await Topic.findOne({ where: { name: topic } });
    if (!topicRecord) {
      return res.status(400).json({ success: false, message: "Chủ đề không hợp lệ." });
    }
    const toBuffer = (dataUrl, fieldName) => {
      if (!dataUrl || !dataUrl.startsWith("data:")) return null;
      const base64 = dataUrl.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const MAX_SIZE = 20 * 1024 * 1024;
      if (buffer.length > MAX_SIZE) {
        throw new Error(`Tệp ${fieldName} vượt quá giới hạn 20MB`);
      }
      return buffer;
    };

    const newPost = await Post.create({
      user_id: decoded.id,
      topic_id: topicRecord.id,
      title,
      body: content,
      image: toBuffer(image, "Ảnh"),
      video: toBuffer(video, "Video"),
      audio: toBuffer(audio, "Âm thanh"),
      status: "Pending",
      created_at: new Date(),
    });

    res.json({ success: true, message: "Đăng bài thành công!", post: newPost });
  } catch (error) {
    console.error("Lỗi khi tạo bài viết:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi tạo bài viết." });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });

    let viewer = null;
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;
    if (token) {
      try {
        viewer = jwt.verify(token, JWT_SECRET);
      } catch {
        viewer = null;
      }
    }

    const post = await Post.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "full_name", "avatar"] },
        { model: Topic, attributes: ["id", "name"] },
      ],
    });

    const [shareCount] = await sequelize.query(
      "SELECT COUNT(*) AS c FROM Share WHERE post_id = ?",
      { replacements: [post.id], type: Sequelize.QueryTypes.SELECT }
    );

    if (!post)
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });
    let userReaction = null;
    if (viewer) {
      const existing = await sequelize.models.PostReaction.findOne({
        where: { post_id: id, user_id: viewer.id },
        include: [{ model: Reaction, attributes: ["name"] }],
      });
      if (existing) userReaction = existing.Reaction.name.toLowerCase();
    }

    const reactions = await Reaction.findAll({ attributes: ["name", "icon"] });
    const reactionMap = Object.fromEntries(reactions.map((r) => [r.name.toLowerCase(), r.icon]));

    const toDataUrl = (buf, mime) =>
      buf && Buffer.isBuffer(buf)
        ? `data:${mime};base64,${buf.toString("base64")}`
        : null;

    const data = {
      id: post.id,
      user_id: post.user_id,
      topic_id: post.topic_id,
      title: post.title,
      content: post.body || "",
      image: toDataUrl(post.image, "image/jpeg"),
      audio: toDataUrl(post.audio, "audio/mpeg"),
      video: toDataUrl(post.video, "video/mp4"),
      status: post.status,
      publishedAt: post.created_at,
      category: post.Topic?.name || "Chưa phân loại",
      userReaction,
      reactions: [
        { name: "Like", icon: reactionMap.like || "👍", count: post.like_count },
        { name: "Love", icon: reactionMap.love || "❤️", count: post.love_count },
        { name: "Haha", icon: reactionMap.haha || "😆", count: post.haha_count },
        { name: "Wow", icon: reactionMap.wow || "😮", count: post.wow_count },
        { name: "Sad", icon: reactionMap.sad || "😢", count: post.sad_count },
        { name: "Angry", icon: reactionMap.angry || "😡", count: post.angry_count },
      ],
      shareCount: shareCount.c,
      author: post.User?.full_name || "Ẩn danh",
      authorAvatar: toDataUrl(post.User?.avatar, "image/jpeg"),
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error("GET /posts/:id", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy bài viết" });
  }
});


router.post("/:id/react", async (req, res) => {
  try {
    const { id } = req.params;
    const { reactionName } = req.body;
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;

    if (!token)
      return res.status(401).json({ success: false, message: "Thiếu token đăng nhập." });

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ success: false, message: "Token không hợp lệ." });
    }

    const post = await Post.findByPk(id);
    if (!post)
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });

    const reaction = await Reaction.findOne({
      where: { name: reactionName },
    });
    if (!reaction)
      return res.status(400).json({ success: false, message: "Tên cảm xúc không hợp lệ." });
    const existing = await sequelize.models.PostReaction.findOne({
      where: { post_id: id, user_id: user.id },
    });

    if (existing) {
      if (existing.reaction_id === reaction.id) {
        await existing.destroy();
        await post.decrement(`${reactionName}_count`);
        return res.json({
          success: true,
          message: `Đã bỏ cảm xúc ${reactionName}`,
          toggledOff: true,
        });
      } else {
        const oldReaction = await Reaction.findByPk(existing.reaction_id);
        await post.decrement(`${oldReaction.name.toLowerCase()}_count`);
        await post.increment(`${reactionName}_count`);
        await existing.update({ reaction_id: reaction.id, reacted_at: new Date() });
        return res.json({
          success: true,
          message: `Đã đổi sang cảm xúc ${reactionName}`,
          toggledOff: false,
        });
      }
    } else {
      await sequelize.models.PostReaction.create({
        post_id: id,
        user_id: user.id,
        reaction_id: reaction.id,
      });
      await post.increment(`${reactionName}_count`);
      return res.json({
        success: true,
        message: `Đã thả cảm xúc ${reactionName}`,
        toggledOff: false,
      });
    }
  } catch (error) {
    console.error("Lỗi khi xử lý cảm xúc:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi xử lý cảm xúc." });
  }
});


router.get("/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    const comments = await sequelize.query(
      `
      SELECT c.id, c.body AS content, c.created_at, c.parent_id,
             u.id AS user_id, u.full_name AS userName, u.avatar
      FROM Comment c
      JOIN User u ON u.id = c.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
      `,
      { replacements: [postId], type: Sequelize.QueryTypes.SELECT }
    );

    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c.id] = {
        id: c.id,
        user_id: c.user_id,
        userName: c.userName,
        userAvatar: c.avatar
          ? `data:image/jpeg;base64,${Buffer.from(c.avatar).toString("base64")}`
          : null,
        content: c.content,
        created_at: dayjs(c.created_at).format("HH:mm DD/MM/YYYY"),
        replies: [],
        parent_id: c.parent_id,
      };
    });

    comments.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    res.json({ success: true, data: roots });
  } catch (err) {
    console.error("Lỗi lấy comment:", err);
    res.status(500).json({ success: false, message: "Không thể lấy bình luận" });
  }
});

module.exports = router;