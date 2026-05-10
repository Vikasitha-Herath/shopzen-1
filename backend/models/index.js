const mongoose = require('mongoose');

// Category
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  image: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
categorySchema.pre('save', function(next) {
  if (!this.slug) this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'');
  next();
});
const Category = mongoose.model('Category', categorySchema);

// Coupon
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  isNewUserOnly: { type: Boolean, default: false },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableBrands: [{ type: String }],
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});
const Coupon = mongoose.model('Coupon', couponSchema);

// Banner
const bannerSchema = new mongoose.Schema({
  title: String, subtitle: String, image: String, link: String,
  buttonText: String,
  position: { type: String, enum: ['hero', 'promo', 'sidebar'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startDate: Date, endDate: Date,
  createdAt: { type: Date, default: Date.now }
});
const Banner = mongoose.model('Banner', bannerSchema);

// Review
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String, comment: String,
  isApproved: { type: Boolean, default: false },
  isVerifiedPurchase: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

// Notification
const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['new_order','low_stock','new_review','new_user','return_request','gift_card','system'], required: true },
  title: String, message: String, link: String,
  isRead: { type: Boolean, default: false },
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

// Settings — extended for full customization
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
  group: { type: String, default: 'general' },
  updatedAt: { type: Date, default: Date.now }
});
const Settings = mongoose.model('Settings', settingsSchema);

// GiftCard
const giftCardSchema = new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true, required: true },
  initialValue: { type: Number, required: true },
  balance: { type: Number, required: true },
  // Who purchased it
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purchaserEmail: String,
  purchaserName: String,
  // Who receives it
  recipientEmail: String,
  recipientName: String,
  recipientPhone: String,
  message: String,
  // Card design/theme
  design: { type: String, default: 'default' }, // 'birthday','christmas','anniversary','default'
  // Payment details
  paymentMethod: { type: String, default: 'bank_transfer' },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  // Activation
  isActive: { type: Boolean, default: false },
  activatedAt: Date,
  expiresAt: Date,
  // Usage tracking
  usageHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: String,
    amount: Number,
    balanceBefore: Number,
    balanceAfter: Number,
    date: { type: Date, default: Date.now }
  }],
  // Admin notes
  adminNote: String,
  createdAt: { type: Date, default: Date.now }
});
const GiftCard = mongoose.model('GiftCard', giftCardSchema);

// ReturnRequest
const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerEmail: String,
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, quantity: Number, reason: String, condition: { type: String, enum: ['unopened','opened','damaged'], default: 'opened' } }],
  reason: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending','approved','rejected','received','refunded'], default: 'pending' },
  adminNote: String, refundAmount: Number,
  refundMethod: { type: String, enum: ['original','store_credit','gift_card'] },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);

// OTP
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const OTP = mongoose.model('OTP', otpSchema);

// SeasonalCampaign
const seasonalCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['new_year','christmas','black_friday','valentines','easter','halloween','eid','custom'], default: 'custom' },
  isActive: { type: Boolean, default: false },
  startDate: Date, endDate: Date,
  theme: {
    primaryColor: { type: String, default: '#b5451b' },
    secondaryColor: { type: String, default: '#f0a500' },
    accentColor: { type: String, default: '#ffffff' },
    bgColor: { type: String, default: '#0f172a' },
    fontStyle: { type: String, default: 'default' },
    bannerImage: String, logoOverlay: String,
    snowEffect: { type: Boolean, default: false },
    confettiEffect: { type: Boolean, default: false },
    customCSS: String
  },
  announcement: String,
  announcementBg: { type: String, default: '#b5451b' },
  discountPercent: { type: Number, default: 0 },
  couponCode: String,
  featuredBannerTitle: String,
  featuredBannerSubtitle: String,
  createdAt: { type: Date, default: Date.now }
});
const SeasonalCampaign = mongoose.model('SeasonalCampaign', seasonalCampaignSchema);

// PaymentGateway config
const paymentGatewaySchema = new mongoose.Schema({
  gateway: { type: String, required: true, unique: true }, // 'payhere','stripe','paypal','razorpay','2checkout'
  isEnabled: { type: Boolean, default: false },
  isLive: { type: Boolean, default: false },
  displayName: String,
  description: String,
  logo: String,
  config: { type: mongoose.Schema.Types.Mixed, default: {} }, // merchant_id, api_key etc
  supportedCurrencies: [String],
  updatedAt: { type: Date, default: Date.now }
});
const PaymentGateway = mongoose.model('PaymentGateway', paymentGatewaySchema);

// DeliveryService
const deliveryServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // 'pronto','kapruka','fedex','custom'
  isEnabled: { type: Boolean, default: false },
  logo: String,
  description: String,
  trackingUrl: String, // e.g. https://pronto.lk/track/{trackingNumber}
  estimatedDays: String, // e.g. "1-3 business days"
  rates: [{
    name: String, // e.g. "Standard", "Express"
    price: Number,
    freeAbove: Number, // free if order above this
    estimatedDays: String
  }],
  areas: [String], // coverage areas
  apiKey: String,
  apiSecret: String,
  createdAt: { type: Date, default: Date.now }
});
const DeliveryService = mongoose.model('DeliveryService', deliveryServiceSchema);

// BusinessPage (About, Contact, Terms, Privacy, FAQ etc)
const businessPageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: String, // HTML content
  metaTitle: String,
  metaDescription: String,
  isActive: { type: Boolean, default: true },
  showInFooter: { type: Boolean, default: true },
  showInNav: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});
const BusinessPage = mongoose.model('BusinessPage', businessPageSchema);

// Newsletter subscriber
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  isActive: { type: Boolean, default: true },
  source: { type: String, default: 'website' },
  createdAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = { Category, Coupon, Banner, Review, Notification, Settings, GiftCard, ReturnRequest, OTP, SeasonalCampaign, PaymentGateway, DeliveryService, BusinessPage, Subscriber };
