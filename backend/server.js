const fs = require("fs");
const path = require('path');
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");


const app = express();
app.use(cors());

// Increase JSON and URL-encoded payload limit
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true })); 
// app.use(bodyParser.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure 'uploads' directory exists before storing images
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Set up routes for authentication
app.use("/api/auth", authRoutes);

// Use the delivery routes
app.use("/api", deliveryRoutes);

// app.use("/api", require("./routes/deliveryRoutes"));


// Add image upload endpoint
app.post("/api/upload-image", async (req, res) => {
    try {
        const { orderId, image } = req.body;
        if (!orderId || !image) {
            return res.status(400).json({ message: "Order ID and image data are required" });
        }

        // Store in database
        const query = "UPDATE orders SET parcel_image = ? WHERE order_id = ?";
        db.query(query, [image, orderId], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Image uploaded successfully!" });
        });

        res.json({ message: "Image uploaded successfully!" });
    } catch (error) {
        console.error("Error saving image:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Handle uncaught exceptions (prevents server crashes)
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});


// Routes for each HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "aafirstpage.html"));
});

app.get("/user", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "aauserpage.html"));
});

app.get("/delivery", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "aadeliverypage.html"));
});

app.get("/guidance", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "aaguidancepage.html"));
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
