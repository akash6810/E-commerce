const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    status: { type: String, default: 'Confirmed' },
    expectedDeliveryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);