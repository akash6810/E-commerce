const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getUserOrders
} = require('../controllers/paymentController');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);
router.get('/my-orders', protect, getUserOrders);

module.exports = router;