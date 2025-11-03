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
          body: p.body || "",
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
    const { title, topic, body, image, video, audio } = req.body;

    if (!title || !topic || !body) {
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
      body: body,
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
      body: post.body || "",
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


router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, topic, body, image, video, audio, status } = req.body;
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Thiếu token đăng nhập." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ success: false, message: "Token không hợp lệ." });
    }

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });

    if (decoded.id !== post.user_id && !decoded.isAdmin) {
      return res.status(403).json({ success: false, message: "Không có quyền sửa bài viết này." });
    }

    if (status && status === "Hidden" && post.status !== "Approved") {
      return res.status(403).json({
        success: false,
        message: "Chỉ bài viết đã được duyệt mới có thể bị ẩn.",
      });
    }

    let topicRecord = post.topic_id;
    if (topic) {
      const found = await Topic.findOne({ where: { name: topic } });
      if (!found) return res.status(400).json({ success: false, message: "Chủ đề không hợp lệ." });
      topicRecord = found.id;
    }

    const toBuffer = (dataUrl, fieldName) => {
      if (!dataUrl || !dataUrl.startsWith("data:")) return null;
      const base64 = dataUrl.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const MAX_SIZE = 20 * 1024 * 1024;
      if (buffer.length > MAX_SIZE) throw new Error(`Tệp ${fieldName} vượt quá 20MB`);
      return buffer;
    };

    const updatedFields = {
      title: title || post.title,
      topic_id: topicRecord,
      body: body || post.body,
      status: status || post.status,
      updated_at: new Date(),
    };

    if (req.body.deleteImage) {
      updatedFields.image = null;
    } else if (typeof image === "string" && image.startsWith("data:")) {
      updatedFields.image = toBuffer(image, "Ảnh");
    } else if (image === null || image === undefined) {
      delete updatedFields.image;
    }

    if (req.body.deleteVideo) {
      updatedFields.video = null;
    } else if (typeof video === "string" && video.startsWith("data:")) {
      updatedFields.video = toBuffer(video, "Video");
    } else if (video === null || video === undefined) {
      delete updatedFields.video;
    }

    if (req.body.deleteAudio) {
      updatedFields.audio = null;
    } else if (typeof audio === "string" && audio.startsWith("data:")) {
      updatedFields.audio = toBuffer(audio, "Âm thanh");
    } else if (audio === null || audio === undefined) {
      delete updatedFields.audio;
    }

    await post.update(updatedFields);

    res.json({ success: true, message: "Cập nhật bài viết thành công!", post });
  } catch (error) {
    console.error("Lỗi sửa bài viết:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi sửa bài viết." });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;

    if (!token)
      return res.status(401).json({ success: false, message: "Thiếu token đăng nhập." });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ success: false, message: "Token không hợp lệ." });
    }

    const post = await Post.findByPk(id);
    if (!post)
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });

    if (decoded.id !== post.user_id && !decoded.isAdmin) {
      return res.status(403).json({ success: false, message: "Không có quyền xóa bài viết này." });
    }

    await post.destroy();
    res.json({ success: true, message: "Đã xóa bài viết." });
  } catch (error) {
    console.error("Lỗi xóa bài viết:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa bài viết." });
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
      SELECT c.id, c.body, c.created_at, c.parent_id,
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
        body: c.body,
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


router.get("/interacted/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }
    const reactedPosts = await sequelize.models.PostReaction.findAll({
      where: { user_id: userId },
      include: [
        { model: sequelize.models.Post, include: [{ model: sequelize.models.Topic }, { model: sequelize.models.User }] },
        { model: sequelize.models.Reaction, attributes: ["name", "icon"] }
      ],
      order: [["reacted_at", "DESC"]],
    });
    const commentedPosts = await sequelize.query(
      `
      SELECT DISTINCT p.*
      FROM Post p
      JOIN Comment c ON c.post_id = p.id
      WHERE c.user_id = ?
      `,
      { replacements: [userId], type: Sequelize.QueryTypes.SELECT }
    );
    const reactionIcons = await Reaction.findAll({ attributes: ["name", "icon"] });
    const reactionMap = Object.fromEntries(reactionIcons.map(r => [r.name.toLowerCase(), r.icon]));
    const toDataUrl = (buf, mime) =>
      buf && Buffer.isBuffer(buf)
        ? `data:${mime};base64,${buf.toString("base64")}`
        : null;
    const postMap = new Map();
    for (const r of reactedPosts) {
      const p = r.Post;
      if (!p) continue;
      const [commentCount] = await sequelize.query(
        "SELECT COUNT(*) AS c FROM Comment WHERE post_id = ?",
        { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
      );
      const [shareCount] = await sequelize.query(
        "SELECT COUNT(*) AS c FROM Share WHERE post_id = ?",
        { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
      );
      const reactions = [
        { icon: reactionMap.like || "👍", count: p.like_count },
        { icon: reactionMap.love || "❤️", count: p.love_count },
        { icon: reactionMap.haha || "😆", count: p.haha_count },
        { icon: reactionMap.wow || "😮", count: p.wow_count },
        { icon: reactionMap.sad || "😢", count: p.sad_count },
        { icon: reactionMap.angry || "😡", count: p.angry_count },
      ];
      postMap.set(p.id, {
        id: p.id,
        user_id: p.user_id,
        title: p.title,
        body: p.body || "",
        author: p.User?.full_name || "Ẩn danh",
        category: p.Topic?.name || "Chưa phân loại",
        image: toDataUrl(p.image, "image/jpeg"),
        video: toDataUrl(p.video, "video/mp4"),
        audio: toDataUrl(p.audio, "audio/mpeg"),
        publishedAt: p.created_at,
        status: p.status,
        reactions,
        comments: commentCount.c,
        shareCount: shareCount.c,
        reaction: r.Reaction?.name || null,
        reactionIcon: r.Reaction?.icon || null,
      });
    }
    for (const p of commentedPosts) {
      if (!postMap.has(p.id)) {
        const user = await User.findByPk(p.user_id);
        const topic = await Topic.findByPk(p.topic_id);
        const [commentCount] = await sequelize.query(
          "SELECT COUNT(*) AS c FROM Comment WHERE post_id = ?",
          { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
        );
        const [shareCount] = await sequelize.query(
          "SELECT COUNT(*) AS c FROM Share WHERE post_id = ?",
          { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
        );
        const reactions = [
          { icon: reactionMap.like || "👍", count: p.like_count },
          { icon: reactionMap.love || "❤️", count: p.love_count },
          { icon: reactionMap.haha || "😆", count: p.haha_count },
          { icon: reactionMap.wow || "😮", count: p.wow_count },
          { icon: reactionMap.sad || "😢", count: p.sad_count },
          { icon: reactionMap.angry || "😡", count: p.angry_count },
        ];
        postMap.set(p.id, {
          id: p.id,
          user_id: p.user_id,
          title: p.title,
          body: p.body || "",
          author: user?.full_name || "Ẩn danh",
          category: topic?.name || "Chưa phân loại",
          image: toDataUrl(p.image, "image/jpeg"),
          video: toDataUrl(p.video, "video/mp4"),
          audio: toDataUrl(p.audio, "audio/mpeg"),
          publishedAt: p.created_at,
          status: p.status,
          reactions,
          comments: commentCount.c,
          shareCount: shareCount.c,
          reaction: null,
          reactionIcon: null,
        });
      }
    }
    const data = Array.from(postMap.values());
    res.json({ success: true, data });
  } catch (err) {
    console.error("GET /posts/interacted/:userId", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách bài viết đã tương tác" });
  }
});


router.get("/:postId/shared-users", async (req, res) => {
  try {
    const { postId } = req.params;
    const users = await sequelize.query(
      `
      SELECT u.id, u.full_name, u.email, u.avatar, s.shared_at
      FROM Share s
      JOIN User u ON u.id = s.shared_by
      WHERE s.post_id = ?
      ORDER BY s.shared_at DESC
      `,
      { replacements: [postId], type: Sequelize.QueryTypes.SELECT }
    );
    const data = users.map(u => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      avatar: u.avatar
        ? `data:image/jpeg;base64,${Buffer.from(u.avatar).toString("base64")}`
        : "https://i.pravatar.cc/100?u=" + u.id,
      sharedAt: new Date(u.shared_at).toLocaleString("vi-VN")
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người chia sẻ:", err);
    res.status(500).json({ success: false, message: "Không thể lấy danh sách người chia sẻ." });
  }
});

module.exports = router;