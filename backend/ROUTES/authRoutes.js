const express = require("express");
// const { signup, login } = require("../controllers/authController");
// const { setOrderId } = require("../controllers/authController");
const { signup, login, setOrderId, deleteDeliveryGuyAndOtps } = require("../controllers/authController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

console.log("setOrderId:", setOrderId);
router.post("/set-order", authenticateUser, setOrderId);

router.delete("/delete-delivery", deleteDeliveryGuyAndOtps);

module.exports = router;
