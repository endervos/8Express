const express = require("express");
const router = express.Router();
const { User, Post } = require("../models");


router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "full_name", "email", "avatar", "date_of_birth", "gender", "is_banned"],
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const posts = await Post.findAll({
      where: { user_id: user.id },
      attributes: ["id", "title", "body", "like_count", "created_at"],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, user, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;