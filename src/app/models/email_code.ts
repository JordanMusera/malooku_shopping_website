import mongoose, { Schema } from "mongoose";

const emailCodeSchema = new Schema({
  email: { type: String, required: true },
  purpose: { type: String, required: true, enum: ["signup", "password_reset"] },
  codeHash: { type: String, required: true },
  pendingUser: { type: Schema.Types.Mixed },
  expiresAt: { type: Date, required: true },
  sentAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

emailCodeSchema.index({ email: 1, purpose: 1 }, { unique: true });
emailCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailCode = mongoose.models.EmailCode || mongoose.model("EmailCode", emailCodeSchema);
export default EmailCode;
