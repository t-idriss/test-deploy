const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true},
    product_id: { type: String, required: true},
    service: { type: String, required: true},
    type: { type: String, required: true},
    city: { type: String, required: true},
    date: { type: String, required: true},
    time: { type: String, required: true},
    client: { 
        full_name: {type: String},
        email: {type: String},
        phone: {type: String},
        address: {type: String},
    },
    price: { type: String, required: true},
    status: { type: String, required: true},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", BookSchema);