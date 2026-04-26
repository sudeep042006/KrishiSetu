import { createOrder, verifyPaymentSignature } from '../services/razorpay.service.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import Project from '../models/Project.js';

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
            const transaction = await Transaction.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { 
                    status: 'success', 
                    paymentId: razorpay_payment_id, 
                    signature: razorpay_signature 
                },
                { new: true }
            );

            if (transaction) {
                // Fetch or Create Wallet
                let wallet = await Wallet.findOne({ userId: transaction.userId });
                if (!wallet) {
                    wallet = await Wallet.create({
                        userId: transaction.userId,
                        availableBalance: 0,
                        pendingBalance: 0,
                        totalEarnings: 0,
                        totalSpent: 0,
                        currency: "INR"
                    });
                }

                // Update Wallet Balance if it was a deposit
                if (transaction.type === 'deposit') {
                    await Wallet.findByIdAndUpdate(wallet._id, {
                        $inc: { availableBalance: transaction.amount }
                    });
                }
                
                // If it was a crop purchase
                if (transaction.type === 'purchase' && transaction.relatedItem) {
                    const project = await Project.findById(transaction.relatedItem);
                    if (project) {
                        // Mark crop as closed (sold)
                        project.status = 'closed';
                        await project.save();

                        // 1. Deduct from buyer's (offtaker's) wallet
                        await Wallet.findByIdAndUpdate(wallet._id, {
                            $inc: { 
                                availableBalance: -transaction.amount,
                                totalSpent: transaction.amount 
                            }
                        });

                        // 2. Add to seller's (farmer's) wallet
                        // Ensure the farmer has a wallet
                        let farmerWallet = await Wallet.findOne({ userId: project.createdBy });
                        if (!farmerWallet) {
                            farmerWallet = await Wallet.create({
                                userId: project.createdBy,
                                availableBalance: 0,
                                pendingBalance: 0,
                                totalEarnings: 0,
                                totalSpent: 0,
                                currency: "INR"
                            });
                        }
                        
                        await Wallet.findByIdAndUpdate(farmerWallet._id, {
                            $inc: { 
                                availableBalance: transaction.amount,
                                totalEarnings: transaction.amount 
                            }
                        });

                        // 3. Create transaction record for the farmer (Seller)
                        await Transaction.create({
                            userId: project.createdBy,
                            amount: transaction.amount,
                            orderId: `sale_${Date.now()}_${project._id}`,
                            paymentId: razorpay_payment_id,
                            status: 'success',
                            type: 'sale',
                            relatedItem: project._id,
                            notes: `Crop Sale: ${project.cropName}`
                        });
                    }
                }
            }

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

export const getWalletDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        let wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
             wallet = await Wallet.create({
                userId,
                availableBalance: 0,
                pendingBalance: 0,
                totalEarnings: 0,
                totalSpent: 0,
                currency: "INR"
            });
        }
        
        res.status(200).json({
            success: true,
            wallet
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const addBankDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bankName, accountNumber, ifscCode, accountHolderName } = req.body;

        if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
            return res.status(400).json({ success: false, message: "All bank details are required" });
        }

        let wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            wallet = await Wallet.create({
                userId,
                availableBalance: 0,
                pendingBalance: 0,
                totalEarnings: 0,
                totalSpent: 0,
                currency: "INR"
            });
        }

        wallet.linkedBankAccount = {
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            isVerified: true // Simulating verification for now
        };

        await wallet.save();

        res.status(200).json({
            success: true,
            message: "Bank details updated successfully",
            wallet
        });
    } catch (error) {
        console.error("Add Bank Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

