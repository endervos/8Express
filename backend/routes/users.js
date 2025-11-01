const express = require("express");
const router = express.Router();
const { User, Follow, sequelize } = require("../models");


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
        : "https://i.pravatar.cc/150?u=" + a.id,
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


router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID người dùng không hợp lệ." });
    }

    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "full_name",
        "email",
        "phone",
        "gender",
        "date_of_birth",
        "avatar",
        "created_at",
      ],
      include: [
        { model: User, as: "Followers", attributes: ["id", "full_name", "email", "avatar"] },
        { model: User, as: "Following", attributes: ["id", "full_name", "email", "avatar"] },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng." });
    }

    const formatted = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || "",
      gender: user.gender || "Không rõ",
      date_of_birth: user.date_of_birth,
      avatar: user.avatar
        ? Buffer.from(user.avatar).toString("base64")
        : null,
      created_at: user.created_at
        ? new Date(user.created_at).toISOString()
        : null,
      Followers:
        user.Followers?.map((f) => ({
          id: f.id,
          full_name: f.full_name,
          email: f.email,
          avatar: f.avatar
            ? Buffer.from(f.avatar).toString("base64")
            : null,
        })) || [],
      Following:
        user.Following?.map((f) => ({
          id: f.id,
          full_name: f.full_name,
          email: f.email,
          avatar: f.avatar
            ? Buffer.from(f.avatar).toString("base64")
            : null,
        })) || [],
    };

    res.json({ success: true, user: formatted });
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin người dùng.",
    });
  }
});

module.exports = router;