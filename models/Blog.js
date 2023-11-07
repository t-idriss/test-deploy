const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    img: { type: String, required: true,},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);