const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  addAddress,
  deleteAddress
} = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');


// Auth
router.post('/register', register); 
router.post('/login', login);

// Profile
router.get('/profile', authMiddleware, getProfile);

// Address Management
router.post('/add-address', authMiddleware, addAddress);
router.delete('/delete-address/:addressId', authMiddleware, deleteAddress);

module.exports = router;