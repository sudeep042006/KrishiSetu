import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'success', 'failed'],
        default: 'created'
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    signature: {
        type: String
    },
    type: {
        type: String,
        enum: ['purchase', 'withdrawal', 'deposit', 'sale'],
        required: true
    },
    relatedItem: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project' // E.g., Crop Listing ID
    },
    notes: {
        type: String
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
