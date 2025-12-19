const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  razorpay_order_id: String,
  razorpay_payment_id: String,

  paymentStatus: {
    type: String,
    default: "Paid"
  },

  orderStatus: {
    type: String,
    default: "Placed"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", OrderSchema);
