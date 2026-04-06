import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },

    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
      default: null,
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentType: {
      type: String,
      enum: [
        "advance",
        "milestone",
        "final",
        "refund",
        "escrow_deposit",
        "escrow_release",
      ],
      required: true,
    },

    paymentMethodType: {
      type: String,
      enum: ["card", "upi", "bank_transfer", "wallet", "cash", "other"],
      default: "upi",
    },

    stripeCustomerId: {
      type: String,
      trim: true,
    },

    stripePaymentIntentId: {
      type: String,
      trim: true,
    },

    stripeCheckoutSessionId: {
      type: String,
      trim: true,
    },

    stripeChargeId: {
      type: String,
      trim: true,
    },

    stripeTransferId: {
      type: String,
      trim: true,
    },

    stripeRefundId: {
      type: String,
      trim: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "requires_action",
        "processing",
        "succeeded",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },

    receiptUrl: {
      type: String,
      trim: true,
    },

    invoiceUrl: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    metadata: {
      type: Map,
      of: String,
      default: {},
    },

    isWebhookVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;