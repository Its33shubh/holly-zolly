const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],

  totalPrice: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE'],
    required: true
  },

  // ✅ SAME AS USER ADDRESS
  address: {
    fullName: String,
    phone: String,
    pincode: String,
    state: String,
    city: String,
    houseNo: String,
    area: String,
    landmark: String
  },

  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered'],
    default: 'Pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);