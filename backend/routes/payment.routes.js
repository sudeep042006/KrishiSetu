import { Router } from "express";
import { checkout, paymentVerification, getUserTransactions, getWalletDetails } from "../controllers/payment.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

// 1. Initiate Checkout (Create Order)
router.post("/checkout", authenticate, checkout);

// 2. Verify Payment
router.post("/verify", authenticate, paymentVerification);

// 3. Get User Transaction History
router.get("/history", authenticate, getUserTransactions);
// 4. Get User Wallet Details
router.get("/wallet", authenticate, getWalletDetails);

export default router;
