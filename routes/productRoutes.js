const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewArrivals,
  getBestSellers,
  getSaleProducts
} = require('../controllers/productController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 8 }
});

// CREATE
router.post('/create', upload.array('images', 8), createProduct);


//new arrivals
router.get("/new-arrivals", getNewArrivals);
//best-sellers
router.get("/best-sellers", getBestSellers);
//sale-products
router.get("/sale-products",getSaleProducts);

// READ
router.get('/all', getProducts);
router.get('/:id', getProductById);

// UPDATE
router.put('/:id', updateProduct);

// DELETE
router.delete('/:id', deleteProduct);


module.exports = router;