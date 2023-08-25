const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true,  unique: true },
    type: { type: String, required: true},
    price: { type: String, required: true},
    description: { type: String, required: true},
    img: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);