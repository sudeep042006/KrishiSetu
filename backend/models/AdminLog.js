import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actionType: {
      type: String,
      enum: [
        "verify_user",
        "suspend_user",
        "approve_project",
        "reject_project",
        "resolve_dispute",
        "approve_document",
        "reject_document",
        "update_contract_status",
        "update_payment_status",
      ],
      required: true,
    },

    targetType: {
      type: String,
      enum: ["user", "project", "contract", "payment", "document", "dispute"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

export default AdminLog;