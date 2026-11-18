
import mongoose from "mongoose";

const urlScanSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    signals: {
      type: [String],
      default: []
    },
    recommendation: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const UrlScan = mongoose.model("UrlScan", urlScanSchema);

export default UrlScan;
