import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    gifts: { type: mongoose.Schema.Types.ObjectId, ref: "Gift", required: true }, 
    customMessage: { type: String, maxlength: 50 },
    otp: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },  
    otpUsed: { type: Boolean, default: false },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Guest", guestSchema);
