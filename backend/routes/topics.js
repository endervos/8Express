const express = require('express');
const router = express.Router();
const { Topic, Post } = require('../models');

router.get('/', async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: [{ model: Post, attributes: ['id'] }]
    });

    const data = topics.map(t => ({
      id: t.id,
      name: t.name,
      icon: 'book',
      postCount: t.Posts?.length || 0
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;