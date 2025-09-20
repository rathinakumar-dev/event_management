import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactNo: { type: String, required: true },
    functionName: { type: String, required: true },
    functionType: { type: String, required: true },
    relationEnabled: { type: Boolean, default: false },
    brideName: { type: String },
    groomName: { type: String },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gifts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gift" }],
    welcomeImage: { type: String },
    guestFormUrl: { type: String, default: "" },
    eventDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

eventSchema.index({ agentId: 1 });
eventSchema.index({ agentId: 1, status: 1 });

export default mongoose.model("Event", eventSchema);
