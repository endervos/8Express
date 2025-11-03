const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, sequelize } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;


router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
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

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const plainUser = user.toJSON();
    if (plainUser.avatar) plainUser.avatar = plainUser.avatar.toString("base64");
    plainUser.isSelf = true;

    res.json({ success: true, user: plainUser });
  } catch (error) {
    console.error("Lỗi /profile:", error);
    res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.id !== parseInt(req.params.id)) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền chỉnh sửa hồ sơ này." });
    }

    const { full_name, password, currentPassword, gender, date_of_birth, phone, avatar } = req.body;
    const user = await User.findByPk(decoded.id);
    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Cần nhập mật khẩu hiện tại để đổi mật khẩu.",
        });
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng.",
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (full_name) user.full_name = full_name;
    if (gender) user.gender = gender;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (phone) user.phone = phone;
    if (avatar && avatar.startsWith("data:image")) {
      const base64Data = avatar.split(",")[1];
      user.avatar = Buffer.from(base64Data, "base64");
    }
    await user.save();
    res.json({ success: true, message: "Cập nhật hồ sơ thành công." });

  } catch (err) {
    console.error("Lỗi cập nhật user:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
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
      avatar: user.avatar ? Buffer.from(user.avatar).toString("base64") : null,
      created_at:
        user.created_at
          ? new Date(user.created_at).toISOString()
          : user.dataValues.created_at || null,
      Followers:
        user.Followers?.map((f) => ({
          id: f.id,
          full_name: f.full_name,
          email: f.email,
          avatar: f.avatar ? Buffer.from(f.avatar).toString("base64") : null,
        })) || [],
      Following:
        user.Following?.map((f) => ({
          id: f.id,
          full_name: f.full_name,
          email: f.email,
          avatar: f.avatar ? Buffer.from(f.avatar).toString("base64") : null,
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


router.get("/top-authors/all", async (req, res) => {
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

module.exports = router;