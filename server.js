const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); 

dotenv.config();

console.log("🔥 CORRECT server.js is running");

const app = express();

// ✅ Body parser (IMPORTANT - missing in your code)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ✅ 🔥 STATIC FOLDER FIX (MAIN CHANGE)
app.use('/uploads', express.static('uploads'));

// ❌ REMOVE this (not needed)
// app.use('/assets', express.static(path.join(__dirname, 'HZ')));

// ✅ Test route
app.get('/test', (req, res) => {
  console.log("✅ TEST API HIT");
  res.send("Server is working perfectly 🚀");
});

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/category', require('./routes/categoryRoutes'));
app.use('/api/product', require('./routes/productRoutes'));
app.use('/api/order', require('./routes/orderRoutes'));

// ✅ 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });