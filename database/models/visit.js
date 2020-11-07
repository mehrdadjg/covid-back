const mongoose = require("mongoose");

const visitSchema = mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  businessEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  birthday: {
    type: Date,
  },
});

module.exports = mongoose.model("Visit", visitSchema);
