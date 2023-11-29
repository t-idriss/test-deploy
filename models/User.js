const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    zip: { type: String },
    state: { type: Boolean, required: true, default: true },
    img: { type: String },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
