const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return this.price == null ? true : value < this.price;
      },
      message: 'Discount price must be less than price'
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  images: {
    type: [String], // array of image URLs or paths
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 1 && arr.length <= 8;
      },
      message: 'At least 1 and maximum 8 images allowed per product'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isSale: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);