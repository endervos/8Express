const express = require("express");
const router = express.Router();
const { Sequelize, User, Admin, Post, Topic, Reaction } = require("../models");
const dayjs = require("dayjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const formatDBTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return dayjs(d).format("HH:mm:ss DD/MM/YYYY");
};

router.get("/stats", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const totalUsers = await User.count();
        const totalPosts = await Post.count();
        const startOfMonth = dayjs().startOf("month").toDate();
        const newUsersThisMonth = await User.count({
            where: { created_at: { [Sequelize.Op.gte]: startOfMonth } },
        });
        const newPostsThisMonth = await Post.count({
            where: { created_at: { [Sequelize.Op.gte]: startOfMonth } },
        });
        const allUsers = await User.findAll({
            raw: true,
            order: [["created_at", "DESC"]],
            attributes: ["id", "full_name", "created_at"],
        });
        const allPosts = await Post.findAll({
            raw: false,
            order: [["created_at", "DESC"]],
            attributes: ["id", "title", "created_at", "user_id", "admin_id"],
            include: [
                { model: User, attributes: ["id", "full_name"] },
                { model: Admin, attributes: ["id", "full_name"] },
            ],
        });
        const allActivities = [
            ...allUsers.map((u) => ({
                type: "user",
                title: "Người dùng mới đăng ký",
                detail: `${u.full_name} vừa tạo tài khoản`,
                time: formatDBTime(u.created_at),
                rawTime: new Date(u.created_at),
            })),
            ...allPosts.map((p) => {
                const author =
                    p.user_id && p.User
                        ? p.User.full_name
                        : p.admin_id && p.Admin
                            ? p.Admin.full_name
                            : "Ẩn danh";
                return {
                    type: "post",
                    title: "Bài viết mới",
                    detail: `${author} đã đăng bài viết “${p.title}”`,
                    time: formatDBTime(p.created_at),
                    rawTime: new Date(p.created_at),
                };
            }),
        ];
        allActivities.sort((a, b) => b.rawTime - a.rawTime);
        const totalActivities = allActivities.length;
        const totalPages = Math.ceil(totalActivities / limit);
        const paginatedActivities = allActivities.slice(offset, offset + limit);
        res.json({
            success: true,
            data: {
                totalUsers,
                totalPosts,
                newUsersThisMonth,
                newPostsThisMonth,
                totalActivities,
                totalPages,
                currentPage: page,
                activitiesPerPage: limit,
                recentActivities: paginatedActivities,
            },
        });
    } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
        res.status(500).json({ success: false, message: "Lỗi khi lấy thống kê" });
    }
});


router.get("/users", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const nameSearch = req.query.name ? req.query.name.trim() : "";
        const emailSearch = req.query.email ? req.query.email.trim() : "";
        const userWhere = {};
        if (nameSearch) userWhere.full_name = { [Sequelize.Op.like]: `%${nameSearch}%` };
        if (emailSearch) userWhere.email = { [Sequelize.Op.like]: `%${emailSearch}%` };
        const adminWhere = {};
        if (nameSearch) adminWhere.full_name = { [Sequelize.Op.like]: `%${nameSearch}%` };
        if (emailSearch) adminWhere.email = { [Sequelize.Op.like]: `%${emailSearch}%` };
        const [users, admins] = await Promise.all([
            User.findAll({
                raw: true,
                where: userWhere,
                order: [["created_at", "DESC"]],
            }),
            Admin.findAll({
                raw: true,
                where: adminWhere,
                order: [["created_at", "DESC"]],
            }),
        ]);
        const combined = [
            ...users.map((u) => ({
                id: u.id,
                role_id: `user-${u.id}`,
                name: u.full_name,
                email: u.email,
                phone: u.phone,
                gender: u.gender,
                date_of_birth: u.date_of_birth,
                role: "user",
                status: u.is_banned ? "inactive" : "active",
                created_at: dayjs(u.created_at).format("YYYY-MM-DD HH:mm:ss"),
            })),
            ...admins.map((a) => ({
                id: a.id,
                role_id: `admin-${a.id}`,
                name: a.full_name,
                email: a.email,
                phone: a.phone,
                gender: a.gender,
                date_of_birth: a.date_of_birth,
                role: "admin",
                status: "active",
                created_at: dayjs(a.created_at).format("YYYY-MM-DD HH:mm:ss"),
            })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const totalRecords = combined.length;
        const totalPages = Math.ceil(totalRecords / limit);
        const paginated = combined.slice(offset, offset + limit);
        res.json({
            success: true,
            data: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit,
                users: paginated,
            },
        });
    } catch (err) {
        console.error("Lỗi lấy danh sách người dùng:", err);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách người dùng" });
    }
});


router.get("/users/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const roleParam = req.query.role?.toLowerCase() || "user";
        if (isNaN(id)) {
            return res
                .status(400)
                .json({ success: false, message: "ID không hợp lệ" });
        }
        let account;
        let role = "user";
        if (roleParam === "admin") {
            account = await Admin.findByPk(id, {
                raw: true,
                attributes: [
                    "id",
                    "full_name",
                    "email",
                    "phone",
                    "gender",
                    "date_of_birth",
                    "created_at",
                    "updated_at"
                ]
            });
            role = "admin";
        } else {
            account = await User.findByPk(id, {
                raw: true,
                attributes: [
                    "id",
                    "full_name",
                    "email",
                    "phone",
                    "gender",
                    "date_of_birth",
                    "is_banned",
                    "created_at",
                    "updated_at"
                ]
            });
        }
        if (!account) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy người dùng" });
        }
        const data = {
            id: account.id,
            full_name: account.full_name,
            email: account.email,
            phone: account.phone || "",
            gender: account.gender || "Không rõ",
            date_of_birth: account.date_of_birth || null,
            created_at: account.created_at
                ? new Date(account.created_at).toISOString()
                : null,
            updated_at: account.updated_at
                ? new Date(account.updated_at).toISOString()
                : null,
            role,
            status: account.is_banned ? "inactive" : "active",
        };
        return res.json({ success: true, data });
    } catch (err) {
        console.error("Lỗi lấy chi tiết người dùng:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết người dùng.",
        });
    }
});


router.post("/users/:id/ban", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        const newStatus = !user.is_banned;
        user.is_banned = newStatus;
        await user.save();
        return res.json({
            success: true,
            message: `Đã ${newStatus ? "vô hiệu hóa" : "kích hoạt"} tài khoản`,
            is_banned: newStatus,
        });
    } catch (err) {
        console.error("Lỗi khi đổi trạng thái người dùng:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi đổi trạng thái người dùng",
        });
    }
});


router.get("/posts", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const { count, rows: posts } = await Post.findAndCountAll({
            include: [
                { model: User, attributes: ["id", "full_name"] },
                { model: Admin, attributes: ["id", "full_name"] },
                { model: Topic, attributes: ["id", "name"] },
            ],
            order: [["created_at", "DESC"]],
            limit,
            offset,
        });
        const toDataUrl = (buf, mime) =>
            buf && Buffer.isBuffer(buf)
                ? `data:${mime};base64,${buf.toString("base64")}`
                : null;
        let reactionMap = {
            like: "👍",
            love: "❤️",
            haha: "😆",
            wow: "😮",
            sad: "😢",
            angry: "😡",
        };
        try {
            const reactions = await Reaction.findAll({ attributes: ["name", "icon"] });
            if (reactions?.length) {
                reactionMap = Object.fromEntries(
                    reactions.map((r) => [r.name.toLowerCase(), r.icon])
                );
            }
        } catch (err) {
            console.warn("Không thể lấy bảng Reaction, dùng icon mặc định.");
        }
        const data = await Promise.all(
            posts.map(async (p) => {
                const [commentCount] = await Post.sequelize.query(
                    "SELECT COUNT(*) AS c FROM Comment WHERE post_id = ?",
                    { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
                );
                const [shareCount] = await Post.sequelize.query(
                    "SELECT COUNT(*) AS c FROM Share WHERE post_id = ?",
                    { replacements: [p.id], type: Sequelize.QueryTypes.SELECT }
                );
                const isAdminPost = p.user_id == null && p.admin_id != null;
                const authorName = isAdminPost
                    ? p.Admin?.full_name || "Ẩn danh (Admin)"
                    : p.User?.full_name || "Ẩn danh (User)";
                const authorRole = isAdminPost ? "admin" : "user";
                const reactionsList = [
                    { name: "like", icon: reactionMap.like, count: p.like_count || 0 },
                    { name: "love", icon: reactionMap.love, count: p.love_count || 0 },
                    { name: "haha", icon: reactionMap.haha, count: p.haha_count || 0 },
                    { name: "wow", icon: reactionMap.wow, count: p.wow_count || 0 },
                    { name: "sad", icon: reactionMap.sad, count: p.sad_count || 0 },
                    { name: "angry", icon: reactionMap.angry, count: p.angry_count || 0 },
                ];
                return {
                    id: p.id,
                    title: p.title,
                    body: p.body,
                    author: authorName,
                    authorRole,
                    status: p.status,
                    category: p.Topic?.name || "Chưa phân loại",
                    createdAt: p.created_at,
                    image: toDataUrl(p.image, "image/jpeg"),
                    audio: toDataUrl(p.audio, "audio/mpeg"),
                    video: toDataUrl(p.video, "video/mp4"),
                    reactions: reactionsList,
                    commentCount: commentCount.c,
                    shareCount: shareCount.c,
                };
            })
        );
        const totalPages = Math.ceil(count / limit);
        res.json({
            success: true,
            data,
            pagination: {
                total: count,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (err) {
        console.error("Lỗi khi lấy danh sách bài viết:", err);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách bài viết.",
        });
    }
});


router.get("/posts/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res
                .status(400)
                .json({ success: false, message: "ID không hợp lệ" });
        }
        const post = await Post.findByPk(id, {
            include: [
                { model: User, attributes: ["id", "full_name", "email", "avatar"] },
                { model: Admin, attributes: ["id", "full_name", "email", "avatar"] },
                { model: Topic, attributes: ["id", "name"] },
            ],
        });

        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy bài viết" });
        }
        const [commentCount] = await Post.sequelize.query(
            "SELECT COUNT(*) AS c FROM Comment WHERE post_id = ?",
            { replacements: [post.id], type: Sequelize.QueryTypes.SELECT }
        );
        const [shareCount] = await Post.sequelize.query(
            "SELECT COUNT(*) AS c FROM Share WHERE post_id = ?",
            { replacements: [post.id], type: Sequelize.QueryTypes.SELECT }
        );
        const commentsRaw = await Post.sequelize.query(
            `
            SELECT c.id, c.body, c.created_at, c.parent_id,
            COALESCE(u.id, a.id) AS user_id,
            COALESCE(u.full_name, a.full_name) AS userName,
            COALESCE(u.avatar, a.avatar) AS avatar
            FROM Comment c
            LEFT JOIN User u ON u.id = c.user_id
            LEFT JOIN Admin a ON a.id = c.admin_id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
            `,
            { replacements: [id], type: Sequelize.QueryTypes.SELECT }
        );
        const map = {};
        const roots = [];
        commentsRaw.forEach((c) => {
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
        commentsRaw.forEach((c) => {
            if (c.parent_id && map[c.parent_id]) {
                map[c.parent_id].replies.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });
        let reactionMap = {
            like: "👍",
            love: "❤️",
            haha: "😆",
            wow: "😮",
            sad: "😢",
            angry: "😡",
        };
        try {
            const reactions = await Reaction.findAll({
                attributes: ["name", "icon"],
            });
            if (reactions?.length) {
                reactionMap = Object.fromEntries(
                    reactions.map((r) => [r.name.toLowerCase(), r.icon])
                );
            }
        } catch (err) {
            console.warn("Không thể lấy bảng Reaction, dùng icon mặc định.");
        }
        const toDataUrl = (buf, mime) =>
            buf && Buffer.isBuffer(buf)
                ? `data:${mime};base64,${buf.toString("base64")}`
                : null;
        const isAdminPost = post.user_id == null && post.admin_id != null;
        const authorName = isAdminPost
            ? post.Admin?.full_name || "Ẩn danh (Admin)"
            : post.User?.full_name || "Ẩn danh (User)";
        const authorAvatar = toDataUrl(
            post.Admin?.avatar || post.User?.avatar,
            "image/jpeg"
        );
        const data = {
            id: post.id,
            title: post.title,
            body: post.body || "",
            category: post.Topic?.name || "Chưa phân loại",
            status: post.status,
            createdAt: post.created_at,
            author: authorName,
            authorEmail: isAdminPost
                ? post.Admin?.email || "Không có email"
                : post.User?.email || "Không có email",
            authorAvatar,
            authorRole: isAdminPost ? "admin" : "user",
            image: toDataUrl(post.image, "image/jpeg"),
            audio: toDataUrl(post.audio, "audio/mpeg"),
            video: toDataUrl(post.video, "video/mp4"),
            reactions: [
                { name: "like", icon: reactionMap.like, count: post.like_count || 0 },
                { name: "love", icon: reactionMap.love, count: post.love_count || 0 },
                { name: "haha", icon: reactionMap.haha, count: post.haha_count || 0 },
                { name: "wow", icon: reactionMap.wow, count: post.wow_count || 0 },
                { name: "sad", icon: reactionMap.sad, count: post.sad_count || 0 },
                { name: "angry", icon: reactionMap.angry, count: post.angry_count || 0 },
            ],
            commentCount: commentCount.c,
            shareCount: shareCount.c,
            comments: roots,
        };
        res.json({ success: true, data });
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết bài viết:", err);
        res.status(500).json({
            success: false,
            message: "Không thể lấy chi tiết bài viết.",
        });
    }
});


router.post("/posts/:id/status", async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { status } = req.body;
        if (isNaN(postId)) {
            return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ" });
        }
        if (!["Approved", "Banned", "Hidden", "Pending"].includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
        }
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ success: false, message: "Thiếu token" });
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Bạn không có quyền duyệt bài" });
        }
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });
        }
        post.status = status;
        post.admin_id = decoded.id;
        await post.save();
        res.json({
            success: true,
            message: `Đã cập nhật trạng thái bài viết thành ${status}`,
            data: { id: post.id, status: post.status, admin_id: post.admin_id },
        });
    } catch (err) {
        console.error("Lỗi khi cập nhật trạng thái bài viết:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật trạng thái bài viết" });
    }
});

module.exports = router;