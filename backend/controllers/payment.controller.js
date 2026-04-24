import { createOrder, verifyPaymentSignature } from '../services/razorpay.service.js';
import Transaction from '../models/Transaction.js';

export const checkout = async (req, res) => {
    try {
        const { amount, relatedItem, type, notes } = req.body;
        const userId = req.user._id; // Requires authentication middleware

        // 1. Create Order in Razorpay
        const receiptId = `receipt_${Date.now()}`;
        const order = await createOrder(amount, "INR", receiptId, { relatedItem });

        // 2. Save "created" transaction in DB
        const transaction = new Transaction({
            userId,
            amount,
            orderId: order.id,
            status: 'created',
            type: type || 'purchase',
            relatedItem,
            notes
        });
        await transaction.save();

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const paymentVerification = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const isAuthentic = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isAuthentic) {
            // Update transaction status to success
            await Transaction.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { 
                    status: 'success', 
                    paymentId: razorpay_payment_id, 
                    signature: razorpay_signature 
                }
            );

            // TODO: Add logic to update Farmer Wallet, change crop status to 'sold', etc.

            res.status(200).json({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            // Update transaction status to failed
            await Transaction.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'failed' }
            );

            res.status(400).json({
                success: false,
                message: "Invalid Signature"
            });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
