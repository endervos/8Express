"use strict";
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Follow, User, Admin, Sequelize } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res
        .status(401)
        .json({ success: false, message: "Thiếu token xác thực" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!["user", "admin"].includes(decoded.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Role không hợp lệ trong token" });
    }
    req.auth = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error("Lỗi xác thực JWT:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}


router.post("/:id", authenticate, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const { targetRole } = req.query;
    const { id: followerId, role: followerRole } = req.auth;
    if (!["user", "admin"].includes(targetRole))
      return res.status(400).json({
        success: false,
        message: "Thiếu role mục tiêu hợp lệ (user hoặc admin)",
      });
    if (followerRole === targetRole && followerId === followingId)
      return res
        .status(400)
        .json({ success: false, message: "Không thể theo dõi chính mình" });
    const where = {
      user_id: followerRole === "user" ? followerId : null,
      admin_id: followerRole === "admin" ? followerId : null,
      following_user_id: targetRole === "user" ? followingId : null,
      following_admin_id: targetRole === "admin" ? followingId : null,
    };
    const [record, created] = await Follow.findOrCreate({ where });
    if (!created)
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã theo dõi người này rồi" });
    res.json({ success: true, message: "Theo dõi thành công" });
  } catch (err) {
    console.error("Lỗi khi theo dõi:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi theo dõi" });
  }
});


router.delete("/:id", authenticate, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const { targetRole } = req.query;
    const { id: followerId, role: followerRole } = req.auth;
    const where = {
      user_id: followerRole === "user" ? followerId : null,
      admin_id: followerRole === "admin" ? followerId : null,
      following_user_id: targetRole === "user" ? followingId : null,
      following_admin_id: targetRole === "admin" ? followingId : null,
    };
    const deleted = await Follow.destroy({ where });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Bạn chưa theo dõi người này" });
    res.json({ success: true, message: "Đã hủy theo dõi" });
  } catch (err) {
    console.error("Lỗi khi hủy theo dõi:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi hủy theo dõi" });
  }
});


router.get("/following/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.query;
    const where =
      role === "admin"
        ? { admin_id: id }
        : { user_id: id };
    const list = await Follow.findAll({
      where,
      include: [
        { model: User, as: "FollowingUser", attributes: ["id", "full_name", "email", "avatar"] },
        { model: Admin, as: "FollowingAdmin", attributes: ["id", "full_name", "email", "avatar"] },
      ],
    });
    const seen = new Set();
    const data = [];
    for (const f of list) {
      if (f.FollowingUser) {
        const u = f.FollowingUser.toJSON();
        const key = `user:${u.id}`;
        if (!seen.has(key)) {
          if (u.avatar) u.avatar = u.avatar.toString("base64");
          data.push({ ...u, role: "user" });
          seen.add(key);
        }
      } else if (f.FollowingAdmin) {
        const a = f.FollowingAdmin.toJSON();
        const key = `admin:${a.id}`;
        if (!seen.has(key)) {
          if (a.avatar) a.avatar = a.avatar.toString("base64");
          data.push({ ...a, role: "admin" });
          seen.add(key);
        }
      }
    }
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("Lỗi lấy danh sách following:", err);
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách following" });
  }
});


router.get("/followers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.query;
    const where =
      role === "admin"
        ? { following_admin_id: id }
        : { following_user_id: id };
    const list = await Follow.findAll({
      where,
      include: [
        { model: User, as: "FollowerUser", attributes: ["id", "full_name", "email", "avatar"] },
        { model: Admin, as: "FollowerAdmin", attributes: ["id", "full_name", "email", "avatar"] },
      ],
    });
    const seen = new Set();
    const data = [];
    for (const f of list) {
      if (f.FollowerUser) {
        const u = f.FollowerUser.toJSON();
        const key = `user:${u.id}`;
        if (!seen.has(key)) {
          if (u.avatar) u.avatar = u.avatar.toString("base64");
          data.push({ ...u, role: "user" });
          seen.add(key);
        }
      } else if (f.FollowerAdmin) {
        const a = f.FollowerAdmin.toJSON();
        const key = `admin:${a.id}`;
        if (!seen.has(key)) {
          if (a.avatar) a.avatar = a.avatar.toString("base64");
          data.push({ ...a, role: "admin" });
          seen.add(key);
        }
      }
    }
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("Lỗi lấy danh sách followers:", err);
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách followers" });
  }
});

module.exports = router;