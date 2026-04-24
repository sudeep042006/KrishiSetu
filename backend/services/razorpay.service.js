import { instance } from '../config/Razorpay.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const createOrder = async (amount, currency = "INR", receipt = "receipt#1", notes = {}) => {
    const options = {
        amount: amount * 100, // amount in smallest currency unit (paise for INR)
        currency,
        receipt,
        notes
    };
    try {
        const order = await instance.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(`Razorpay Order Creation Failed: ${error.message}`);
    }
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) throw new Error("Razorpay Key Secret is missing in env");

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

    return expectedSignature === signature;
};
