const Category = require("../models/Category");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

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

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    // Allow filenames as well (e.g., "image.png")
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(string);
  }
};

const uploadImageUrlToCloudinary = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const fileName = imageUrl.split('/').pop() || 'image';
    return await uploadToCloudinary(buffer, fileName);
  } catch (error) {
    console.error('Error uploading image URL to Cloudinary:', error.message);
    throw new Error(`Failed to upload image URL to Cloudinary: ${error.message}`);
  }
};

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, image, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Convert status string to boolean
    const isActive = status === "Active" ? true : false;

    let imageUrl;

    if (req.file) {
      // File upload case - upload to Cloudinary
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    } else if (image) {
      // Validate image URL
      if (!isValidUrl(image)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image URL",
        });
      }
      // Image URL case - download and upload to Cloudinary
      imageUrl = await uploadImageUrlToCloudinary(image);
    } else {
      return res.status(400).json({
        success: false,
        message: "Image is required (upload file or provide URL)",
      });
    }

    const category = new Category({ name, image: imageUrl, isActive });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.log("CREATE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.log("GET CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE CATEGORY
exports.getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.log("GET SINGLE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { name, status, image } = req.body;

    // Convert status string to boolean
    const isActive = status === "Active" ? true : false;
    let updateData = { name, isActive };

    if (req.file) {
      // File upload case - upload to Cloudinary
      const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      updateData.image = imageUrl;
    } else if (image) {
      // Validate image URL
      if (!isValidUrl(image)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image URL",
        });
      }
      // Image URL case - download and upload to Cloudinary
      const imageUrl = await uploadImageUrlToCloudinary(image);
      updateData.image = imageUrl;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (error) {
    console.log("UPDATE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    console.log("DELETE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};