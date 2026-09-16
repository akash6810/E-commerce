const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById
} = require("../controllers/productController");

// Import middleware and multer upload configuration
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/cloudinary");

// PROTECTED ROUTE: Requires Bearer Token + handles image file upload

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", protect, upload.single("image"), createProduct);
router.put("/:id", protect, upload.single("image"), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;