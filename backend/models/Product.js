const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String, default: "" },
        imageUrl: { type: String }, // Cloudinary secure URL
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)
module.exports = mongoose.model("Product", productSchema)