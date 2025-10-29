const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Follow, User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;


function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "Thiếu token xác thực" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Lỗi xác thực JWT:", err.message);
    return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}


router.post("/:id", authenticate, async (req, res) => {
  try {
    const followerId = req.userId;
    const followingId = parseInt(req.params.id);

    if (isNaN(followingId))
      return res.status(400).json({ success: false, message: "ID người được theo dõi không hợp lệ" });

    if (followerId === followingId)
      return res.status(400).json({ success: false, message: "Không thể theo dõi chính mình" });

    const [record, created] = await Follow.findOrCreate({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!created)
      return res.status(400).json({ success: false, message: "Bạn đã theo dõi người này" });

    res.json({ success: true, message: "Theo dõi thành công" });
  } catch (err) {
    console.error("Lỗi khi theo dõi:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi theo dõi" });
  }
});


router.delete("/:id", authenticate, async (req, res) => {
  try {
    const followerId = req.userId;
    const followingId = parseInt(req.params.id);

    const deleted = await Follow.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Bạn chưa theo dõi người này" });

    res.json({ success: true, message: "Đã hủy theo dõi" });
  } catch (err) {
    console.error("Lỗi khi hủy theo dõi:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi hủy theo dõi" });
  }
});


router.get("/following/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const list = await Follow.findAll({
      where: { follower_id: id },
      include: [
        {
          model: User,
          as: "Following",
          attributes: ["id", "full_name", "email", "avatar"]
        }
      ],
    });
    const data = list.map(f => {
      const u = f.Following.toJSON();
      if (u.avatar) u.avatar = u.avatar.toString("base64");
      return u;
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi lấy danh sách following:", err);
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách following" });
  }
});


router.get("/followers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const list = await Follow.findAll({
      where: { following_id: id },
      include: [
        {
          model: User,
          as: "Follower",
          attributes: ["id", "full_name", "email", "avatar"]
        }
      ],
    });
    const data = list.map(f => {
      const u = f.Follower.toJSON();
      if (u.avatar) u.avatar = u.avatar.toString("base64");
      return u;
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi lấy danh sách followers:", err);
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách followers" });
  }
});

module.exports = router;