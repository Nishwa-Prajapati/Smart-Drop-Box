const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Upload image function
const uploadImage = async (req, res) => {
    const { orderId, image } = req.body;

    if (!orderId || !image) {
        return res.status(400).json({ error: "Order ID and image are required" });
    }

    try {
        // Convert base64 to image file
        const imageBuffer = Buffer.from(image.split(",")[1], "base64");
        const imageName = `parcel_${Date.now()}.png`;
        const imagePath = path.join(__dirname, "../uploads", imageName);

        // Save the image file locally
        fs.writeFileSync(imagePath, imageBuffer);

        // Save the image path in database under the correct order_id
        const sql = "UPDATE orders SET parcel_image=? WHERE order_id=?";
        db.query(sql, [imageName, orderId], (err, result) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "Image uploaded successfully", imageName });
        });
    } catch (error) {
        console.error("Error saving image:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const getParcelImage = (req, res) => {
    const orderId = req.params.orderId;

    const sql = "SELECT parcel_image FROM orders WHERE order_id = ?";
    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "No such Order ID exists." });
        }

        // Define this properly
        const imageFileName = result[0].parcel_image.toString();

        if (!imageFileName) {
            return res.json({ success: true, status: "waiting" });
        }

        const imagePath = path.join(__dirname, "../uploads", imageFileName);

        if (!fs.existsSync(imagePath)) {
            return res.json({ success: true, status: "waiting" });
        }

        // Build full image URL here
        const imageUrl = `http://localhost:5001/uploads/${imageFileName}`;
        res.json({
            success: true,
            status: "image",
            image: imageUrl, // ✅ REAL image path for frontend <img src="">
        });
    });
};



// Register delivery guy (Avoiding duplicate entries)

async function registerDeliveryGuy(req, res) {
    console.log('Request Body:', req.body);
    const { full_name, agency_name, order_id, mobile_number, email  } = req.body;


    // **Step 1: Check if the delivery is already completed**
    db.query('SELECT parcel_image FROM orders WHERE order_id = ?', [order_id], (err, orderResults) => {
        if (err) {
            console.error('Database Query Error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (orderResults.length === 0) {
            return res.status(404).json({ message: 'Order ID not found' });
        }

        const parcelImage = orderResults[0].parcel_image;

        if (parcelImage) {
            // **If an image exists, delivery is already completed**
            console.log("🚚 Delivery already completed for Order ID:", order_id);
            return res.status(400).json({ message: 'Delivery already completed for this Order ID' });
        }

        // **Step 2: Continue only if delivery is NOT completed**
        console.log("✅ No parcel image found, proceeding with delivery guy registration...");

    // Check if order_id exists in the orders table
    db.query('SELECT * FROM orders WHERE order_id = ?', [order_id], (err, orderResults) => {
        if (err) {
            console.error('Database Query Error:', err);
            console.log('Order Results:', orderResults);
            return res.status(500).json({ message: 'Database error' });
        }

        let matchStatus = orderResults.length > 0 ? 'matched' : 'not matched';

        // Check if the delivery guy already exists with the same order_id and mobile_number
        db.query(
            'SELECT id FROM delivery_guys WHERE order_id = ? AND mobile_number = ?',
            [order_id, mobile_number],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }

                if (results.length > 0) {
                    // Delivery guy already exists, no need to insert again
                    return res.status(200).json({ message: 'Delivery guy already registered', matchStatus });
                }


                 // Prepare delivery guy data for insertion
                 const deliveryData = {
                    full_name,
                    agency_name,
                    order_id,
                    mobile_number,
                    match_status: matchStatus
                };

                // Insert new delivery guy with error handling
                try {
                    db.query('INSERT INTO delivery_guys SET ?', deliveryData, (err) => {
                        if (err) {
                            console.error('Delivery Insert Error:', err);
                            return res.status(500).json({ message: 'Failed to store delivery guy info' });
                        }
                        console.log('Delivery guy registered successfully:', deliveryData);
                        return res.status(200).json({ message: 'Delivery guy registered successfully', matchStatus });
                    });
                } catch (error) {
                    console.error('Unexpected Error during insertion:', error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
            }
        );
    });
});
}



async function generateOtp(req, res) {
    const { order_id, delivery_guy_name, email } = req.body;

    if (!order_id || !delivery_guy_name || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // STEP 1: Validate order_id and parcel_image
    db.query('SELECT parcel_image FROM orders WHERE order_id = ?', [order_id], (err, orderResults) => {
        if (err) {
            console.error('❌ DB Error [orders]:', err);
            return res.status(500).json({ message: 'Database error while checking order' });
        }

        if (orderResults.length === 0) {
            return res.status(404).json({ message: 'Order ID not found' });
        }

        const parcelImage = orderResults[0].parcel_image;

        if (parcelImage !== null && parcelImage !== '') {
            return res.status(400).json({ message: 'Delivery already completed for this Order ID' });
        }

        // STEP 2: Validate delivery guy name with the same order_id
        db.query('SELECT id FROM delivery_guys WHERE full_name = ? AND order_id = ?', [delivery_guy_name, order_id], (err, guyResults) => {
            if (err) {
                console.error('❌ DB Error [delivery_guys]:', err);
                return res.status(500).json({ message: 'Error checking delivery guy' });
            }

            if (guyResults.length === 0) {
                return res.status(404).json({ message: 'Delivery guy not found for this Order ID' });
            }

            const deliveryGuyId = guyResults[0].id;

            // STEP 3: Check recent OTP within 1 minute
            db.query(
                'SELECT * FROM otps WHERE delivery_guy_id = ? AND order_id = ? AND expiry_time > NOW() - INTERVAL 1 MINUTE',
                [deliveryGuyId, order_id],
                (err, otpResults) => {
                    if (err) {
                        console.error('❌ DB Error [otps]:', err);
                        return res.status(500).json({ message: 'Error checking existing OTPs' });
                    }

                    if (otpResults.length > 0) {
                        return res.status(429).json({ message: 'OTP already sent. Please wait before requesting again.' });
                    }

                    // STEP 4: Generate OTP
                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                    const expiryTime = new Date(Date.now() + 60 * 1000); // 1 minute from now

                    // STEP 5: Save OTP
                    db.query(
                        'INSERT INTO otps (otp, expiry_time, delivery_guy_id, order_id, email) VALUES (?, ?, ?, ?, ?)',
                        [otp, expiryTime, deliveryGuyId, order_id, email],
                        (err) => {
                            if (err) {
                                console.error('❌ DB Insert Error [otps]:', err);
                                return res.status(500).json({ message: 'Database error while saving OTP' });
                            }

                            // STEP 6: Send Email
                            const mailOptions = {
                                from: process.env.EMAIL_USER,
                                to: email,
                                subject: 'Your OTP for Parcel Delivery',
                                text: `Hi ${delivery_guy_name},\n\nYour OTP for Order ID ${order_id} is: ${otp}.\nIt expires in 1 minute.\n\nThank you!`
                            };

                            transporter.sendMail(mailOptions, (err, info) => {
                                if (err) {
                                    console.error('❌ Email Error:', err);
                                    return res.status(500).json({ message: 'OTP generated but failed to send email.' });
                                }

                                console.log('✅ OTP sent successfully:', otp);
                                return res.status(200).json({
                                    message: 'OTP generated and sent successfully',
                                    otpSent: true,
                                    expiresIn: 60
                                });
                            });
                        }
                    );
                }
            );
        });
    });
}


// Validate OTP (For "Done/OK" button)
async function validateOtp(req, res) {
    const { order_id, entered_otp } = req.body;

    // Check if OTP is valid and not expired
    db.query(
        'SELECT * FROM otps WHERE order_id = ? AND otp = ? AND expiry_time > NOW()',
        [order_id, entered_otp],
        (err, results) => {
            if (err) {
                console.error('Error validating OTP:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            // Mark OTP as used by deleting it (optional for better tracking)
            db.query(
                'DELETE FROM otps WHERE id = ?',
                [results[0].id],
                (err) => {
                    if (err) {
                        console.error('Error marking OTP as used:', err);
                        return res.status(500).json({ message: 'Error updating OTP status' });
                    }

                    console.log('✅ OTP validated successfully.');
                    return res.status(200).json({ message: 'OTP verified successfully' });
                }
            );
        }
    );
}


//  DELETE delivery guy + associated OTPs
const deleteDeliveryGuyAndOtps = (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ message: "Order ID is required!" });
    }

    //  Step 1: Check if delivery guy exists
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

            //  Step 3: Then delete delivery guy
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

module.exports = router;



module.exports = { registerDeliveryGuy, generateOtp, validateOtp, uploadImage, getParcelImage, deleteDeliveryGuyAndOtps };
