const express = require("express");
const router = express.Router();
const { User, sequelize } = require("../models");

router.get("/top-authors", async (req, res) => {
  try {
    const authors = await User.findAll({
      attributes: [
        "id",
        "full_name",
        "avatar",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Post AS p
            WHERE p.user_id = User.id
              AND p.status = 'Approved'
          )`),
          "postCount",
        ],
      ],
      order: [[sequelize.literal("postCount"), "DESC"]],
      limit: 3,
    });

    const data = authors.map((a) => ({
      id: a.id,
      name: a.full_name,
      avatar: a.avatar
        ? `data:image/jpeg;base64,${Buffer.from(a.avatar).toString("base64")}`
        : "/default-avatar.png",
      postCount: a.getDataValue("postCount"),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi lấy top authors:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tác giả nổi bật.",
    });
  }
});

module.exports = router;