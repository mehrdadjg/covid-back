const mongoose = require("mongoose");

const businessSchema = mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  link: { type: String, required: true, trim: true, lowercase: true },
  emailVerified: { type: String, required: true, default: "f", trim: true },
  emailVerificationSentAt: { type: Date },
  profile: {
    businessName: { type: String, trim: true },
    businessType: { type: Number, enum: [0, 1, 2] },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    province: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    postalCode: {
      type: String,
      trim: true,
      minlength: 6,
      maxlength: 6,
    },
    phoneNumber: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 10,
    },
    preferredTime: {
      type: Number,
      enum: [0, 1, 2, 3],
    },
    submissionMessage: { type: String, trim: true },
  },
});
businessSchema.index({ email: 1 }, { sparse: false, unique: true });
businessSchema.index({ link: -1 }, { sparse: false, unique: true });

module.exports = mongoose.model("Business", businessSchema);
