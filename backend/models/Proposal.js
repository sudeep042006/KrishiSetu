import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    proposedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    proposedStartDate: {
      type: Date,
    },

    proposedEndDate: {
      type: Date,
    },

    message: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn", "negotiating"],
      default: "pending",
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Proposal = mongoose.model("Proposal", proposalSchema);

export default Proposal;