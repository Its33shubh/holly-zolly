const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ CLOUDINARY_URL: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'holly-zolly-products' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const {
      categoryId,
      productName,
      size,
      price,
      discountPrice,
      rating,
      isActive,
      isBestSeller,
      isSale,
      description
    } = req.body;

    let images = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length > 8) {
        return res.status(400).json({ message: 'Maximum 8 images allowed per product' });
      }

      images = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, file.originalname))
      );
    } else if (req.body.images) {
      images = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
    }

    // Validate required fields
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!size) {
      return res.status(400).json({ message: 'Size is required' });
    }
    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }
    if (discountPrice === undefined || discountPrice === null || discountPrice === '') {
      return res.status(400).json({ message: 'Discount price is required' });
    }
    const priceValue = Number(price);
    const discountValue = Number(discountPrice);
    if (Number.isNaN(priceValue) || Number.isNaN(discountValue)) {
      return res.status(400).json({ message: 'Price and discount price must be valid numbers' });
    }
    if (discountValue >= priceValue) {
      return res.status(400).json({ message: 'Discount price must be less than price' });
    }
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Images are required' });
    }
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }
    if (images.length < 1) {
      return res.status(400).json({ message: 'At least 1 image is required' });
    }
    if (images.length > 8) {
      return res.status(400).json({ message: 'Maximum 8 images allowed per product' });
    }

    const product = new Product({
      categoryId,
      productName,
      size,
      price: Number(price),
      discountPrice: Number(discountPrice),
      rating,
      images,
      isActive,
      isBestSeller,
      isSale,
      description
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.log('CREATE PRODUCT ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('categoryId', 'name');

    res.status(200).json(products);

  } catch (error) {
    console.log('GET PRODUCTS ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id })
      .populate('categoryId', 'name');

    if (!product) {
      console.log(`Product with ID ${id} not found in DB`);
      return res.status(404).json({ message: 'Product not found in Database' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('SERVER ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { images, size, price, discountPrice } = req.body;

    // Validate images if provided
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({ message: 'Images must be an array' });
      }
      if (images.length < 1) {
        return res.status(400).json({ message: 'At least 1 image is required' });
      }
      if (images.length > 8) {
        return res.status(400).json({ message: 'Maximum 8 images allowed per product' });
      }
    }

    if (size !== undefined && typeof size !== 'string') {
      return res.status(400).json({ message: 'Size must be a string' });
    }

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newPrice = price !== undefined ? Number(price) : existingProduct.price;
    const newDiscountPrice = discountPrice !== undefined
      ? Number(discountPrice)
      : existingProduct.discountPrice;

    if (price !== undefined && Number.isNaN(newPrice)) {
      return res.status(400).json({ message: 'Price must be a valid number' });
    }
    if (discountPrice !== undefined && Number.isNaN(newDiscountPrice)) {
      return res.status(400).json({ message: 'Discount price must be a valid number' });
    }
    if (newDiscountPrice >= newPrice) {
      return res.status(400).json({ message: 'Discount price must be less than price' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(size !== undefined && { size }),
        ...(price !== undefined && { price: newPrice }),
        ...(discountPrice !== undefined && { discountPrice: newDiscountPrice })
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.log('UPDATE PRODUCT ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.log('DELETE PRODUCT ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// NEW ARRIVALS
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(products);

  } catch (error) {
    console.log("NEW ARRIVALS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// BEST SELLERS
exports.getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({
      isBestSeller: true,
      isActive: true
    }).populate("categoryId", "name");

    res.status(200).json(products);

  } catch (error) {
    console.log("BEST SELLER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// SALE PRODUCTS
exports.getSaleProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isSale: true,
      isActive: true
    }).populate("categoryId", "name");

    res.status(200).json(products);

  } catch (error) {
    console.log("SALE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};