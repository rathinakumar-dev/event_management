import mongoose from "mongoose";

const giftSchema = new mongoose.Schema(
  {
    giftName: { type: String, required: true, trim: true, maxlength: 50 },
    giftImage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Gift", giftSchema);
