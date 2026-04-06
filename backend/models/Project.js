import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    creatorRole: {
      type: String,
      enum: ["farmer", "offtaker"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    cropName: {
      type: String,
      required: true,
      trim: true,
    },

    quantityRequired: {
      type: Number,
      required: true,
      min: 1,
    },

    quantityUnit: {
      type: String,
      enum: ["kg", "quintal", "ton", "bag", "crate"],
      default: "kg",
    },

    expectedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    priceUnit: {
      type: String,
      enum: ["per_kg", "per_quintal", "per_ton", "total"],
      default: "total",
    },

    location: {
      state: {
        type: String,
        required: true,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      village: {
        type: String,
        trim: true,
      },
    },

    startDate: {
      type: Date,
    },

    expectedDeliveryDate: {
      type: Date,
    },

    paymentModel: {
      type: String,
      enum: ["advance", "milestone", "delivery_based"],
      default: "advance",
    },

    qualityRequirements: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["open", "in_negotiation", "contracted", "closed", "cancelled"],
      default: "open",
    },

    totalApplications: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;