import { 
    checkout, 
    paymentVerification, 
    getUserTransactions, 
    getWalletDetails,
    addBankDetails
} from "../controllers/payment.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

// 1. Initiate Checkout (Create Order)
router.post("/checkout", authenticate, checkout);

// 2. Verify Payment
router.post("/verify", authenticate, paymentVerification);

// 3. Get User Transaction History
router.get("/history", authenticate, getUserTransactions);
// 4. Get User Wallet Details
router.get("/wallet", authenticate, getWalletDetails);
// 5. Add/Update Bank Details
router.post("/bank", authenticate, addBankDetails);

export default router;
