import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    offtakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contractCode: {
      type: String,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    cropName: {
      type: String,
      required: true,
      trim: true,
    },

    cropCategory: {
      type: String,
      trim: true,
    },

    agreedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    quantityUnit: {
      type: String,
      enum: ["kg", "quintal", "ton", "bag", "crate"],
      default: "kg",
    },

    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    priceUnit: {
      type: String,
      enum: ["per_kg", "per_quintal", "per_ton", "total"],
      default: "total",
    },

    totalContractValue: {
      type: Number,
      required: true,
      min: 0,
    },

    landArea: {
      type: Number,
      min: 0,
    },

    landUnit: {
      type: String,
      enum: ["acre", "hectare"],
    },

    location: {
      state: { type: String, trim: true },
      district: { type: String, trim: true },
      village: { type: String, trim: true },
      pincode: { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    sowingDate: {
      type: Date,
    },

    expectedHarvestDate: {
      type: Date,
    },

    paymentModel: {
      type: String,
      enum: ["advance", "milestone", "delivery_based", "escrow"],
      default: "advance",
    },

    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    advancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },

    escrowEnabled: {
      type: Boolean,
      default: false,
    },

    responsibilities: {
      seedBy: {
        type: String,
        enum: ["farmer", "offtaker", "shared"],
      },
      fertilizerBy: {
        type: String,
        enum: ["farmer", "offtaker", "shared"],
      },
      pesticideBy: {
        type: String,
        enum: ["farmer", "offtaker", "shared"],
      },
      transportBy: {
        type: String,
        enum: ["farmer", "offtaker", "shared"],
      },
      qualityCheckBy: {
        type: String,
        enum: ["farmer", "offtaker", "shared", "third_party"],
      },
      insuranceBy: {
        type: String,
        enum: ["farmer", "offtaker", "shared", "none"],
        default: "none",
      },
    },

    qualityTerms: {
      type: String,
      trim: true,
    },

    deliveryTerms: {
      type: String,
      trim: true,
    },

    rejectionPolicy: {
      type: String,
      trim: true,
    },

    penaltyTerms: {
      type: String,
      trim: true,
    },

    cancellationTerms: {
      type: String,
      trim: true,
    },

    disputeResolutionTerms: {
      type: String,
      trim: true,
    },

    signedByFarmer: {
      type: Boolean,
      default: false,
    },

    signedByOfftaker: {
      type: Boolean,
      default: false,
    },

    signedAtFarmer: {
      type: Date,
    },

    signedAtOfftaker: {
      type: Date,
    },

    agreementDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "drafted",
        "pending_signature",
        "active",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "drafted",
    },
  },
  { timestamps: true }
);

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;