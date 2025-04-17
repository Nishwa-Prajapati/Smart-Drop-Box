const db = require("../db");
const express = require("express");
const { registerDeliveryGuy, generateOtp,  validateOtp, uploadImage,  getParcelImage, deleteDeliveryGuyAndOtps } = require("../controllers/deliveryController");

const router = express.Router();

// Route to register a delivery guy
router.post("/register-delivery-guy", registerDeliveryGuy);

// Route to generate OTP for delivery guy
router.post("/generate-otp", generateOtp);

router.post('/validate-otp', validateOtp);

router.post("/upload-image", uploadImage);

// Define the route for fetching parcel images
router.get("/getParcelImage/:orderId", getParcelImage);

//Get OTP + timestamp using order_id
router.get("/get-otp", (req, res) => {
  const orderId = req.query.order_id;

  db.query(
      "SELECT otp, created_at FROM otps WHERE order_id = ? AND expiry_time > NOW() ORDER BY created_at DESC LIMIT 1",
      [orderId],
      (error, results) => {
          if (error) {
              console.error("❌ Error fetching OTP:", error);
              return res.status(500).json({ message: "Internal Server Error" });
          }

          if (results.length > 0) {
              const { otp, created_at } = results[0];
              res.json({
                  otp,
                  timestamp: new Date(created_at).getTime() // ✅ ⏰ timestamp in milliseconds
              });
          } else {
              res.status(404).json({ message: "OTP not found or expired" });
          }
      }
  );
});

// Debug: Confirm the route is loaded
console.log('✅ deliveryRoutes loaded');

router.delete("/delete-delivery", deleteDeliveryGuyAndOtps);

module.exports = router;
