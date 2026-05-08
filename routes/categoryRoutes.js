const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  createCategory,
  getCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const upload = multer({
  storage: multer.memoryStorage(),
});

// CREATE
router.post("/create", upload.single("image"), createCategory);

// READ
router.get("/", getCategories);
router.get("/:id", getSingleCategory);

// UPDATE
router.put("/:id", upload.single("image"), updateCategory);

// DELETE
router.delete("/:id", deleteCategory);

module.exports = router;