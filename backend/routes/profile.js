const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Post } = require("../models");

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
        "created_at"
      ],
      include: [
        { model: User, as: "Followers", attributes: ["id", "full_name", "email"] },
        { model: User, as: "Following", attributes: ["id", "full_name", "email"] },
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

    const { full_name, email, password, gender, date_of_birth, phone } = req.body;
    const user = await User.findByPk(decoded.id);
    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    if (password) user.password = await bcrypt.hash(password, 10);
    Object.assign(user, { full_name, email, gender, date_of_birth, phone });
    await user.save();

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật user:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật" });
  }
});

module.exports = router;