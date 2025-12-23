const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
  },
  createdSt: {
    type: Date,
    default: Date.now()
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  
},
{timestamps:true},
);

module.exports = mongoose.model('Review', reviewSchema);
