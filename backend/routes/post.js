const express = require('express');
const router = express.Router();
const { Post, User, Topic } = require('../models');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['full_name'] },
        { model: Topic, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const data = posts.map(p => ({
      id: p.id,
      title: p.title,
      excerpt: p.body ? p.body.slice(0, 150) + '...' : '',
      author: p.User?.full_name || 'Ẩn danh',
      category: p.Topic?.name || 'Chưa phân loại',
      likes: p.like_count,
      views: p.like_count + p.wow_count,
      publishedAt: p.created_at,
      status: p.is_disabled ? 'hidden' : 'published'
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;