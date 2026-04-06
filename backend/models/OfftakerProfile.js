import mongoose from "mongoose";

const offtakerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    businessType: {
      type: String,
      enum: [
        "wholesaler",
        "exporter",
        "processor",
        "retailer",
        "aggregator",
        "startup",
        "ngo",
        "other",
      ],
      required: true,
    },

    industryCategory: {
      type: String,
      trim: true,
    },

    contactPersonName: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    companyEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    companyPhone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    companyDescription: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    establishedYear: {
      type: Number,
      min: 1900,
    },

    employeeCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    headquarters: {
      addressLine1: {
        type: String,
        trim: true,
      },
      addressLine2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
      },
    },

    operatingRegions: [
      {
        type: String,
        trim: true,
      },
    ],

    preferredCrops: [
      {
        type: String,
        trim: true,
      },
    ],

    procurementCapacity: {
      type: Number,
      min: 0,
      default: 0,
    },

    procurementUnit: {
      type: String,
      enum: ["kg", "quintal", "ton", "bag", "crate"],
      default: "kg",
    },

    minimumOrderQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    maximumOrderQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    paymentTermsPreference: {
      type: String,
      enum: ["advance", "delivery_based", "milestone", "escrow", "negotiable"],
      default: "negotiable",
    },

    averagePaymentCycleDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    logisticsSupportAvailable: {
      type: Boolean,
      default: false,
    },

    seedSupportAvailable: {
      type: Boolean,
      default: false,
    },

    fertilizerSupportAvailable: {
      type: Boolean,
      default: false,
    },

    insuranceSupportAvailable: {
      type: Boolean,
      default: false,
    },

    qualityStandards: [
      {
        type: String,
        trim: true,
      },
    ],

    certifications: [
      {
        type: String,
        trim: true,
      },
    ],

    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],

    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalReviews: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalContractsCompleted: {
      type: Number,
      min: 0,
      default: 0,
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },

    isBusinessVerified: {
      type: Boolean,
      default: false,
    },

    isKycSubmitted: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    profileCompletionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

const OfftakerProfile = mongoose.model("OfftakerProfile", offtakerProfileSchema);

export default OfftakerProfile;