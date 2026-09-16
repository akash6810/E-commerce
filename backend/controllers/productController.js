const Product = require("../models/Product");
const mongoose = require("mongoose");
const createProduct = async (req, res) => {
  try {
    const { name, price, category,description } = req.body;

    // req.file is provided by multer/cloudinary
    const imageUrl = req.file ? req.file.path : null;

    const product = new Product({
      name,
      price,
      category,
      description,
      imageUrl,
      user: req.user._id // coming from the protect middleware
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (er) {
    res.status(500).json({
      message: er.message
    });
  }
};

const getProducts = async (req, res) => {
  try {
    // populate('user', 'name email') shows user details instead of just ID
    const Allproducts = await Product.find().populate("user", "name email");
    res.status(200).json(Allproducts);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("user", "name email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if the ID received is a valid 24-character hex string
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid Product ID format: ${id}` });
    }

    // 2. Find product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Ownership check (safely extract user ID)
    const productOwnerId = product.user?._id ? product.user._id.toString() : product.user.toString();
    
    if (productOwnerId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    // 4. Delete
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the logged-in user owns this product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    // Build update object
    const updateData = {
      name: req.body.name || product.name,
      price: req.body.price || product.price,
      category: req.body.category || product.category,
      description: req.body.description !== undefined ? req.body.description : product.description,
    };

    // If a new image was uploaded via Multer, update imageUrl
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById
};