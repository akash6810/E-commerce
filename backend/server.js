const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes")
const authRoutes = require("./routes/authRoutes")
const paymentRoutes = require('./routes/paymentRoutes');



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use('/api/payment', paymentRoutes);

app.get("/", (req, res) => {
    res.send("Server is running");
});
mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("MongoDB connected successfully😊👍");
        app.listen(process.env.PORT, () => {
            console.log(
                `Server running on port ${process.env.PORT}`
            );
        });

    })
    .catch((error) => {
        console.log(
            "MongoDB connection error:⚠️",
            error.message
        );

    });