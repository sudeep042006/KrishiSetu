import { createOrder, verifyPaymentSignature } from '../services/razorpay.service.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import Project from '../models/Project.js';

export const checkout = async (req, res) => {
    try {
        const { amount, relatedItem, type, notes } = req.body;
        const userId = req.user._id; // Requires authentication middleware

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Valid amount is required" });
        }

        // If it's a crop purchase, validate project availability
        if (type === 'purchase' && relatedItem) {
            const project = await Project.findById(relatedItem);
            if (!project) {
                return res.status(404).json({ success: false, message: "Crop project not found" });
            }
            if (project.status === 'closed') {
                return res.status(400).json({ success: false, message: "This crop has already been sold" });
            }
            if (project.createdBy.toString() === userId.toString()) {
                return res.status(400).json({ success: false, message: "You cannot purchase your own crop listing" });
            }
        }

        // 1. Create Order in Razorpay
        const receiptId = `receipt_${Date.now()}`;
        const order = await createOrder(amount, "INR", receiptId, { relatedItem });

        // 2. Save "created" transaction in DB
        const transaction = new Transaction({
            userId,
            amount: Number(amount),
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
        res.status(500).json({ success: false, message: error.message || "Server Error" });
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

                // 1. If it was a deposit: Add to available balance
                if (transaction.type === 'deposit') {
                    await Wallet.findByIdAndUpdate(wallet._id, {
                        $inc: { availableBalance: transaction.amount }
                    });
                }
                
                // 2. If it was a crop purchase directly via Razorpay Gateway
                if (transaction.type === 'purchase' && transaction.relatedItem) {
                    const project = await Project.findById(transaction.relatedItem);
                    if (project) {
                        // Mark crop as closed (sold)
                        project.status = 'closed';
                        await project.save();

                        // Update buyer's wallet:
                        // Buyer paid directly via Razorpay Gateway with fresh external money (card/UPI).
                        // Increment totalSpent ONLY. Do NOT deduct availableBalance!
                        await Wallet.findByIdAndUpdate(wallet._id, {
                            $inc: { 
                                totalSpent: transaction.amount 
                            }
                        });

                        // Add funds to seller's (farmer's) wallet
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

                        // Create transaction record for the farmer (Seller)
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

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            // Update transaction status to failed
            await Transaction.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'failed' }
            );

            return res.status(400).json({
                success: false,
                message: "Invalid Signature"
            });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Pay using in-app wallet balance
export const payWithWallet = async (req, res) => {
    try {
        const { projectId, amount } = req.body;
        const buyerId = req.user._id;

        if (!projectId) {
            return res.status(400).json({ success: false, message: "Project ID is required" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Crop project not found" });
        }
        if (project.status === 'closed') {
            return res.status(400).json({ success: false, message: "This crop has already been sold" });
        }
        if (project.createdBy.toString() === buyerId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot purchase your own crop" });
        }

        const purchaseAmount = Number(amount) || (Number(project.expectedPrice) * Number(project.quantityRequired || 1));

        let buyerWallet = await Wallet.findOne({ userId: buyerId });
        if (!buyerWallet || buyerWallet.availableBalance < purchaseAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient wallet balance. Available: ₹${buyerWallet?.availableBalance || 0}, Required: ₹${purchaseAmount}` 
            });
        }

        // Deduct from buyer
        await Wallet.findByIdAndUpdate(buyerWallet._id, {
            $inc: {
                availableBalance: -purchaseAmount,
                totalSpent: purchaseAmount
            }
        });

        // Add to seller (farmer)
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
                availableBalance: purchaseAmount,
                totalEarnings: purchaseAmount
            }
        });

        // Mark crop closed
        project.status = 'closed';
        await project.save();

        const orderId = `wallet_${Date.now()}_${project._id}`;

        // Create transaction for buyer
        await Transaction.create({
            userId: buyerId,
            amount: purchaseAmount,
            orderId,
            status: 'success',
            type: 'purchase',
            relatedItem: project._id,
            notes: `Wallet Purchase: ${project.cropName}`
        });

        // Create transaction for seller
        await Transaction.create({
            userId: project.createdBy,
            amount: purchaseAmount,
            orderId: `sale_${orderId}`,
            status: 'success',
            type: 'sale',
            relatedItem: project._id,
            notes: `Wallet Crop Sale: ${project.cropName}`
        });

        return res.status(200).json({
            success: true,
            message: "Crop purchased successfully using wallet balance"
        });
    } catch (error) {
        console.error("Pay with wallet error:", error);
        return res.status(500).json({ success: false, message: "Error processing wallet payment" });
    }
};

// Request withdrawal from wallet to linked bank account
export const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;
        const withdrawAmount = Number(amount);

        if (!withdrawAmount || withdrawAmount <= 0) {
            return res.status(400).json({ success: false, message: "Please provide a valid withdrawal amount" });
        }

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: "Wallet not found" });
        }

        if (!wallet.linkedBankAccount?.accountNumber) {
            return res.status(400).json({ success: false, message: "Please link a bank account before requesting withdrawal" });
        }

        if (wallet.availableBalance < withdrawAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient balance. Available: ₹${wallet.availableBalance}, Requested: ₹${withdrawAmount}` 
            });
        }

        // Deduct from available balance
        wallet.availableBalance -= withdrawAmount;
        await wallet.save();

        // Create withdrawal transaction
        const withdrawalTx = await Transaction.create({
            userId,
            amount: withdrawAmount,
            orderId: `withdraw_${Date.now()}`,
            status: 'success',
            type: 'withdrawal',
            notes: `Payout to ${wallet.linkedBankAccount.bankName} (A/C: ****${wallet.linkedBankAccount.accountNumber.slice(-4)})`
        });

        return res.status(200).json({
            success: true,
            message: `Withdrawal of ₹${withdrawAmount} processed successfully to ${wallet.linkedBankAccount.bankName}`,
            wallet,
            transaction: withdrawalTx
        });
    } catch (error) {
        console.error("Withdrawal error:", error);
        return res.status(500).json({ success: false, message: "Server error processing withdrawal" });
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
        } else if (wallet.availableBalance < 0) {
            // Auto-heal past negative balance bug
            wallet.availableBalance = 0;
            await wallet.save();
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

