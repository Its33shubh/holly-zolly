const express = require('express');
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

// Create Order
router.post('/', createOrder);

// Get All Orders 
router.get('/', getAllOrders);

// Get Orders by User
router.get('/user/:userId', getUserOrders);

// Get Single Order 🔥
router.get('/:id', getSingleOrder);

// Update Status
router.put('/:id', updateOrderStatus);

// Delete Order (optional)
router.delete('/:id', deleteOrder);

module.exports = router;