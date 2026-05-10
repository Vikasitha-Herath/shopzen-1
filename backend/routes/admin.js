const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalOrders, pendingOrders, todayOrders,
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalProducts, lowStockProducts,
      totalCustomers, newCustomersMonth, unreadOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: thisMonth }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ isRead: false })
    ]);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueChart = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const topProducts = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name soldCount price thumbnail');

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName');

    res.json({
      stats: {
        totalOrders, pendingOrders, todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
        totalProducts, lowStockProducts,
        totalCustomers, newCustomersMonth, unreadOrders
      },
      revenueChart, topProducts, ordersByStatus, recentOrders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All customers
router.get('/customers', adminAuth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
    const total = await User.countDocuments(filter);
    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ customers, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle customer active status
router.put('/customers/:id/status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create admin user
router.post('/create-admin', adminAuth, async (req, res) => {
  try {
    const user = await User.create({ ...req.body, role: 'admin' });
    res.status(201).json({ message: 'Admin created', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
