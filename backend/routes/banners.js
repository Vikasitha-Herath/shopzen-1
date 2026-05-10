const express = require('express');
const router = express.Router();
const { Banner } = require('../models/index');
const { adminAuth } = require('../middleware/auth');

// Public + Admin - Get banners
router.get('/', async (req, res) => {
  try {
    const { position, admin } = req.query;
    // If admin=true, return all banners (no auth required for Settings tab convenience)
    const filter = admin === 'true' ? {} : { isActive: true };
    if (position) filter.position = position;
    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin - Get all banners
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create banner
router.post('/', adminAuth, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update banner
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete banner
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
