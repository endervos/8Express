const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Admin, Follow, sequelize } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "Thiếu token" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, role } = decoded;
    const Model = role === "admin" ? Admin : User;
    const account = await Model.findByPk(id, {
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
      ...(role === "user"
        ? {
          include: [
            {
              model: User,
              as: "Followers",
              attributes: ["id", "full_name", "email", "avatar"],
            },
            {
              model: User,
              as: "Following",
              attributes: ["id", "full_name", "email", "avatar"],
            },
          ],
        }
        : {}),
    });
    if (!account)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tài khoản." });
    const plain = account.toJSON();
    if (plain.avatar && Buffer.isBuffer(plain.avatar))
      plain.avatar = plain.avatar.toString("base64");
    plain.role = role;
    plain.isSelf = true;
    res.json({ success: true, user: plain });
  } catch (error) {
    console.error("Lỗi /profile:", error);
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "Thiếu token" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id: tokenId, role: tokenRole } = decoded;
    const targetId = parseInt(req.params.id);
    if (tokenId !== targetId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa hồ sơ của người khác.",
      });
    }
    const Model = tokenRole === "admin" ? Admin : User;
    const account = await Model.findByPk(tokenId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản.",
      });
    }
    const {
      full_name,
      password,
      currentPassword,
      gender,
      date_of_birth,
      phone,
      avatar,
    } = req.body;
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Cần nhập mật khẩu hiện tại để đổi mật khẩu.",
        });
      }
      const match = await bcrypt.compare(currentPassword, account.password);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng.",
        });
      }
      account.password = await bcrypt.hash(password, 10);
    }
    if (full_name) account.full_name = full_name;
    if (gender) account.gender = gender;
    if (date_of_birth) account.date_of_birth = date_of_birth;
    if (phone) account.phone = phone;
    if (avatar && avatar.startsWith("data:image")) {
      const base64Data = avatar.split(",")[1];
      account.avatar = Buffer.from(base64Data, "base64");
    }
    await account.save();
    res.json({ success: true, message: "Cập nhật hồ sơ thành công." });
  } catch (err) {
    console.error("Lỗi cập nhật hồ sơ:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật." });
  }
});


router.get("/top-authors/all", async (req, res) => {
  try {
    const [userAuthors, adminAuthors] = await Promise.all([
      User.findAll({
        attributes: [
          "id",
          "full_name",
          "avatar",
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Post AS p
              WHERE p.status = 'Approved'
                AND p.user_id = User.id
                AND (p.admin_id IS NULL OR p.admin_id IS NOT NULL)
            )`),
            "postCount",
          ],
        ],
      }),
      Admin.findAll({
        attributes: [
          "id",
          "full_name",
          "avatar",
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Post AS p
              WHERE p.status = 'Approved'
                AND p.admin_id = Admin.id
                AND p.user_id IS NULL
            )`),
            "postCount",
          ],
        ],
      }),
    ]);
    const combined = [
      ...userAuthors.map((a) => ({
        id: a.id,
        name: a.full_name,
        avatar: a.avatar
          ? `data:image/jpeg;base64,${Buffer.from(a.avatar).toString("base64")}`
          : `https://i.pravatar.cc/150?u=user-${a.id}`,
        postCount: a.getDataValue("postCount"),
        role: "user",
      })),
      ...adminAuthors.map((a) => ({
        id: a.id,
        name: a.full_name,
        avatar: a.avatar
          ? `data:image/jpeg;base64,${Buffer.from(a.avatar).toString("base64")}`
          : `https://i.pravatar.cc/150?u=admin-${a.id}`,
        postCount: a.getDataValue("postCount"),
        role: "admin",
      })),
    ];
    combined.sort((a, b) => b.postCount - a.postCount);
    res.json({ success: true, data: combined.slice(0, 5) });
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
    const roleQuery = req.query.role?.toLowerCase();
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ.",
      });
    }
    let role = roleQuery || "user";
    let account = null;
    if (role === "admin") {
      account = await Admin.findByPk(id, {
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
      });
    } else {
      account = await User.findByPk(id, {
        attributes: [
          "id",
          "full_name",
          "email",
          "phone",
          "gender",
          "date_of_birth",
          "avatar",
          "created_at",
          "is_banned",
        ],
        include: [
          {
            model: User,
            as: "Followers",
            attributes: ["id", "full_name", "email", "avatar"],
          },
          {
            model: User,
            as: "Following",
            attributes: ["id", "full_name", "email", "avatar"],
          },
        ],
      });
    }
    if (!account && !roleQuery) {
      account = await Admin.findByPk(id, {
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
      });
      if (account) role = "admin";
    }
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng hoặc quản trị viên.",
      });
    }
    try {
      followersCount = await Follow.count({
        where: role === "user"
          ? { following_user_id: id }
          : { following_admin_id: id },
      });
      followingCount = await Follow.count({
        where: role === "user"
          ? { user_id: id }
          : { admin_id: id },
      });
    } catch (err) {
      console.error("Lỗi khi đếm follow:", err);
    }
    const formatted = {
      id: account.id,
      full_name: account.full_name,
      email: account.email,
      phone: account.phone || "",
      gender: account.gender || "Không rõ",
      date_of_birth: account.date_of_birth,
      avatar:
        account.avatar && Buffer.isBuffer(account.avatar)
          ? Buffer.from(account.avatar).toString("base64")
          : null,
      created_at: account.created_at
        ? new Date(account.created_at).toISOString()
        : account.dataValues?.created_at || null,
      role,
      is_banned: account.is_banned || false,
      Followers:
        account.Followers?.map((f) => ({
          id: f.id,
          full_name: f.full_name,
          email: f.email,
          avatar:
            f.avatar && Buffer.isBuffer(f.avatar)
              ? Buffer.from(f.avatar).toString("base64")
              : null,
          role: "user",
        })) || [],
      Following:
        account.Following?.map((f) => ({
          id: f.id,
          full_name: f.full_name,
          email: f.email,
          avatar:
            f.avatar && Buffer.isBuffer(f.avatar)
              ? Buffer.from(f.avatar).toString("base64")
              : null,
          role: "user",
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