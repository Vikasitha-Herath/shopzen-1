const express = require('express');
const router = express.Router();
const { DeliveryService } = require('../models/index');
const { adminAuth } = require('../middleware/auth');

// Public - Get enabled delivery services
router.get('/', async (req, res) => {
  try {
    const services = await DeliveryService.find({ isEnabled: true }).select('-apiKey -apiSecret');
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public - Calculate delivery cost
router.post('/calculate', async (req, res) => {
  try {
    const { serviceCode, orderAmount, area } = req.body;
    const service = await DeliveryService.findOne({ code: serviceCode, isEnabled: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    let cost = 0;
    const rate = service.rates[0];
    if (rate) {
      cost = (rate.freeAbove && orderAmount >= rate.freeAbove) ? 0 : rate.price;
    }
    res.json({ cost, estimatedDays: rate?.estimatedDays || service.estimatedDays });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin - Get all services
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const services = await DeliveryService.find().sort({ name: 1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin - Create/update service
router.put('/admin/:code', adminAuth, async (req, res) => {
  try {
    const result = await DeliveryService.findOneAndUpdate(
      { code: req.params.code }, { ...req.body, code: req.params.code }, { upsert: true, new: true }
    );
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin - Toggle service
router.put('/admin/:code/toggle', adminAuth, async (req, res) => {
  try {
    const svc = await DeliveryService.findOne({ code: req.params.code });
    if (!svc) return res.status(404).json({ message: 'Service not found' });
    svc.isEnabled = !svc.isEnabled;
    await svc.save();
    res.json(svc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin - Delete service
router.delete('/admin/:code', adminAuth, async (req, res) => {
  try {
    await DeliveryService.findOneAndDelete({ code: req.params.code });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
