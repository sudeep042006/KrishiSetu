import { 
    checkout, 
    paymentVerification, 
    getUserTransactions, 
    getWalletDetails,
    addBankDetails,
    payWithWallet,
    requestWithdrawal
} from "../controllers/payment.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

// 1. Initiate Checkout (Create Order)
router.post("/checkout", authenticate, checkout);

// 2. Verify Payment
router.post("/verify", authenticate, paymentVerification);

// 3. Pay using in-app wallet balance
router.post("/pay-with-wallet", authenticate, payWithWallet);

// 4. Request withdrawal to linked bank account
router.post("/withdraw", authenticate, requestWithdrawal);

// 5. Get User Transaction History
router.get("/history", authenticate, getUserTransactions);

// 6. Get User Wallet Details
router.get("/wallet", authenticate, getWalletDetails);

// 7. Add/Update Bank Details
router.post("/bank", authenticate, addBankDetails);

export default router;
