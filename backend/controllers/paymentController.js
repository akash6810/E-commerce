const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order'); // 
const sendOrderConfirmationEmail = require('../utils/sendEmail');


// POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    const amountInPaise = Math.round(Number(amount) * 100);
    // Razorpay accepts amounts in paise (1 INR = 100 paise)
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// POST /api/payment/verify-payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      totalAmount,
    } = req.body;

    // Check user auth context
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User unauthorized' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Calculate delivery date (1 week from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    // Save order in MongoDB
    const newOrder = await Order.create({
      user: req.user._id,
      items: items || [],
      shippingAddress: shippingAddress || {},
      totalAmount: Number(totalAmount) || 0,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      expectedDeliveryDate: deliveryDate,
    });

    // Send confirmation email asynchronously without blocking the response
    if (req.user.email) {
      sendOrderConfirmationEmail(req.user.email, newOrder);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order recorded',
      order: newOrder,
    });
  } catch (error) {
    // Print the exact terminal error for debugging
    console.error('Verify Payment Server Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getUserOrders
};