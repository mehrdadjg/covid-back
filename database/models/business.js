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
  qrSettings: {
    pdf: {
      topLine: {
        text: {
          type: String,
          required: true,
          trim: true,
          default: "Use your Camera app to scan the following code",
        },
        fontSize: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3],
          default: 1,
        },
        fontColor: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3, 4, 5],
          default: 0,
        },
      },
      qrImageSize: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3],
        default: 2,
      },
      paragraphCount: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3],
        default: 3,
      },
      paragraph1: {
        text: {
          type: String,
          required: true,
          trim: true,
          default:
            "Once you do this, a web page will open up in your phone that asks for your contact information. If we suspect that you came into contact with people who may have been sick, we will contact you. Don't forget to call us at 587-111-1111 or visit covid-19-alert.com to notify us, if you start experiencing symptoms.",
        },
        fontSize: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3],
          default: 1,
        },
        alignment: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3],
          default: 3,
        },
        fontColor: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3, 4, 5],
          default: 0,
        },
        spaceAfter: {
          type: Boolean,
          required: true,
          default: true,
        },
      },
      paragraph2: {
        text: {
          type: String,
          required: true,
          trim: true,
          default: "We can stop the spread of this virus",
        },
        fontSize: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3],
          default: 1,
        },
        alignment: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3],
          default: 1,
        },
        fontColor: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3, 4, 5],
          default: 0,
        },
        spaceAfter: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
      paragraph3: {
        text: {
          type: String,
          required: true,
          trim: true,
          default: "together",
        },
        fontSize: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3],
          default: 3,
        },
        alignment: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3],
          default: 1,
        },
        fontColor: {
          type: Number,
          required: true,
          enum: [0, 1, 2, 3, 4, 5],
          default: 3,
        },
      },
    },
  },
});
businessSchema.index({ email: 1 }, { sparse: false, unique: true });
businessSchema.index({ link: -1 }, { sparse: false, unique: true });

module.exports = mongoose.model("Business", businessSchema);
