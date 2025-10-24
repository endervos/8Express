"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ===== Import Models =====
const UserModel = require("./models/user");
const PostModel = require("./models/post");
const TopicModel = require("./models/topic");
const FollowModel = require("./models/follow");

// ===== Utils =====
const { sendVerificationEmail } = require("./utils/mailer");

// ===== Khởi tạo app =====
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

// ===== Kết nối MySQL =====
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    timezone: "+07:00",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true,
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false,
    },
  }
);

// ===== Khởi tạo model =====
const User = UserModel(sequelize, Sequelize.DataTypes);
const Post = PostModel(sequelize, Sequelize.DataTypes);
const Topic = TopicModel(sequelize, Sequelize.DataTypes);
const Follow = FollowModel(sequelize, Sequelize.DataTypes);

Post.belongsTo(User, { foreignKey: "user_id" });
Post.belongsTo(Topic, { foreignKey: "topic_id" });
User.hasMany(Post, { foreignKey: "user_id" });
Topic.hasMany(Post, { foreignKey: "topic_id" });

User.belongsToMany(User, {
  through: Follow,
  as: "Followers",
  foreignKey: "following_id",
  otherKey: "follower_id",
});

User.belongsToMany(User, {
  through: Follow,
  as: "Following",
  foreignKey: "follower_id",
  otherKey: "following_id",
});

// ===== Kiểm tra kết nối =====
sequelize
  .authenticate()
  .then(() => console.log("Kết nối MySQL thành công"))
  .catch((err) => console.error("Lỗi kết nối MySQL:", err));

sequelize
  .sync()
  .then(() => console.log("Sequelize đã sync"))
  .catch((err) => console.error("Lỗi sync DB:", err));

// ===== SMTP mailer =====
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ===== OTP Store =====
const otpStore = new Map();

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Server 8Express hoạt động!");
});


app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

    const code = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, { code, expiresAt: dayjs().add(5, "minute") });

    const sent = await sendVerificationEmail(email, code);
    if (!sent) throw new Error("Không thể gửi email.");

    res.json({ success: true, message: "Mã xác thực đã được gửi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Không thể gửi mã xác thực." });
  }
});


app.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;
  const record = otpStore.get(email);

  if (!record)
    return res.status(400).json({ success: false, message: "Không có mã nào được gửi." });
  if (dayjs().isAfter(record.expiresAt))
    return res.status(400).json({ success: false, message: "Mã đã hết hạn." });
  if (String(record.code) !== String(code))
    return res.status(400).json({ success: false, message: "Mã không chính xác." });

  otpStore.delete(email);
  res.json({ success: true, message: "Xác thực thành công!" });
});


app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phone, birthYear, birthMonth, birthDay, gender } = req.body;
    const date_of_birth = `${birthYear}-${birthMonth}-${birthDay}`;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name: fullName,
      email,
      password: hashedPassword,
      phone,
      gender,
      date_of_birth,
    });

    res.json({ success: true, message: "Đăng ký thành công!", user: newUser });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu sai!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu sai!" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, message: "Đăng nhập thành công!", token, user });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});


app.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: User, as: "Followers", attributes: ["id", "full_name", "email"] },
        { model: User, as: "Following", attributes: ["id", "full_name", "email"] },
      ],
    });

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
});


app.post("/follow/:id", async (req, res) => {
  try {
    const followerId = req.body.follower_id;
    const followingId = parseInt(req.params.id);

    if (followerId === followingId)
      return res.status(400).json({ success: false, message: "Không thể theo dõi chính mình" });

    const [record, created] = await Follow.findOrCreate({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!created)
      return res.status(400).json({ success: false, message: "Bạn đã theo dõi người này" });

    res.json({ success: true, message: "Theo dõi thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server khi theo dõi" });
  }
});


app.delete("/unfollow/:id", async (req, res) => {
  try {
    const followerId = req.body.follower_id;
    const followingId = parseInt(req.params.id);

    const deleted = await Follow.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Bạn chưa theo dõi người này" });

    res.json({ success: true, message: "Đã hủy theo dõi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server khi hủy theo dõi" });
  }
});


app.get("/following/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const list = await Follow.findAll({
      where: { follower_id: id },
      include: [{ model: User, as: "Following", attributes: ["id", "full_name", "email"] }],
    });
    res.json({ success: true, data: list.map(f => f.Following) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách following" });
  }
});


app.get("/followers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const list = await Follow.findAll({
      where: { following_id: id },
      include: [{ model: User, as: "Follower", attributes: ["id", "full_name", "email"] }],
    });
    res.json({ success: true, data: list.map(f => f.Follower) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách followers" });
  }
});


app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ["full_name"] },
        { model: Topic, attributes: ["name"] },
      ],
      order: [["created_at", "DESC"]],
    });

    const data = posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.body ? p.body.slice(0, 200) + "..." : "",
      author: p.User?.full_name || "Ẩn danh",
      category: p.Topic?.name || "Chưa phân loại",
      likes: p.like_count,
      views: p.like_count + p.haha_count + p.wow_count,
      publishedAt: p.created_at,
      status: p.is_disabled ? "hidden" : "published",
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi lấy bài viết:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy bài viết." });
  }
});


app.get("/topics", async (req, res) => {
  try {
    const topics = await Topic.findAll({ include: [{ model: Post }] });
    const data = topics.map((t) => ({
      id: t.id,
      name: t.name,
      icon: "book",
      postCount: t.Posts ? t.Posts.length : 0,
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi lấy chủ đề:", err);
    res.status(500).json({ success: false, message: "Không thể lấy chủ đề." });
  }
});


app.put("/profile/:id", async (req, res) => {
  try {
    const { full_name, email, password, gender, date_of_birth } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }
    user.full_name = full_name;
    user.email = email;
    user.gender = gender;
    user.date_of_birth = date_of_birth;
    await user.save();

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật user:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật" });
  }
});


app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});