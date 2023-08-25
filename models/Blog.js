const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true},
    description: { type: String, required: true, unique: true },
    img: { type: String, required: true, unique: true},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);