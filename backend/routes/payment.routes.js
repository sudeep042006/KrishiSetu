import { Router } from "express";
import { checkout, paymentVerification, getUserTransactions } from "../controllers/payment.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

// 1. Initiate Checkout (Create Order)
router.post("/checkout", authenticate, checkout);

// 2. Verify Payment
router.post("/verify", authenticate, paymentVerification);

// 3. Get User Transaction History
router.get("/history", authenticate, getUserTransactions);

export default router;
