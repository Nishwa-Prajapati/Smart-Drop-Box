const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const signup = (req, res) => {
    const { name, mobile_number, user_id, password } = req.body;

    if (!name || !mobile_number || !user_id || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insert into database
    const sql = "INSERT INTO users (name, mobile_number, user_id, password_hash) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, mobile_number, user_id, hashedPassword], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error!" });
        }
        res.status(201).json({ message: "✅ User registered successfully! now LOGIN to move further." });
    });
};



const login = (req, res) => { 
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "SELECT * FROM users WHERE user_id = ?";
    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error!" });
        }
        if (result.length === 0) {
            return res.status(401).json({ message: "❌ Invalid credentials" });
        }

        const user = result[0];

        // Compare hashed password
        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "❌ Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, user_id: user.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "✅ Login successful!", token });
    });
};




const setOrderId = (req, res) => {
    const { orderId } = req.body;
    const userId = req.user.user_id; // Ensure this comes from middleware

    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required!" });
    }

    //  Step 1: Check if user exists
    const checkUserSql = "SELECT * FROM users WHERE user_id = ?";
    db.query(checkUserSql, [userId], (err, userResult) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error!" });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: "❌ User not found!" });
        }

        // Step 2: Check if Order ID already exists
        const checkOrderSql = "SELECT * FROM orders WHERE order_id = ?";
        db.query(checkOrderSql, [orderId], (err, orderResult) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Database error!" });
            }

            if (orderResult.length > 0) {
                return res.status(400).json({ message: "❌ Order ID already exists! Choose a different one." });
            }

            //  Step 3: Insert into orders table
            const insertSql = "INSERT INTO orders (user_id, order_id) VALUES (?, ?)";
            db.query(insertSql, [userId, orderId], (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ message: "Database error!" });
                }

                res.status(200).json({ message: "✅ Order ID stored successfully!" });
            });
        });
    });
};

//  DELETE delivery guy + associated OTPs
const deleteDeliveryGuyAndOtps = (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ message: "Order ID is required!" });
    }

    // Step 1: Check if delivery guy exists
    const checkSql = "SELECT * FROM delivery_guys WHERE order_id = ?";
    db.query(checkSql, [order_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error!" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "❌ Delivery guy not found!" });
        }

        //  Step 2: Delete OTPs first
        const deleteOtpsSql = "DELETE FROM otps WHERE order_id = ?";
        db.query(deleteOtpsSql, [order_id], (err, otpDeleteResult) => {
            if (err) {
                console.error("❌ OTP Deletion Error:", err);
                return res.status(500).json({ message: "Error deleting OTPs!" });
            }

            // Step 3: Then delete delivery guy
            const deleteDeliverySql = "DELETE FROM delivery_guys WHERE order_id = ?";
            db.query(deleteDeliverySql, [order_id], (err, deliveryDeleteResult) => {
                if (err) {
                    console.error("❌ Delivery Deletion Error:", err);
                    return res.status(500).json({ message: "Error deleting delivery guy!" });
                }

                res.status(200).json({ message: "✅ Delivery guy and OTPs deleted successfully!" });
            });
        });
    });
};

//  Ensure proper export
module.exports = { signup, login, setOrderId, deleteDeliveryGuyAndOtps };
