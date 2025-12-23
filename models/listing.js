const mongoose = require("mongoose");
const reviews = require("./review");
const { ref, required } = require("joi");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
  url: String,
  filename: String,
  },
  price: {
    type: Number,
  },
  location: String,
  country: String,

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type : Schema.Types.ObjectId,
    ref: "User"
  },
  geometry:{
    type:{
      type: String,
      enum:["Point"],
      required: true
    },
    coordinates:{
      type: [Number],
      default:[0,0],
      required : true,
    },
  },
   views: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  categories: {
  type: [String],
  enum: [
    "mountains",
    "amazing-pools",
    "camping",
    "farms",
    "iconic",
    "boats",
    "arctic",
    "domes",
    "castles",
  ],
  index: true
},
});

module.exports = mongoose.model("Listing", listingSchema);



// const mongoose = require("mongoose");

// const listingSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   Image:{
//     type:String,692b0304a79c0741e2d692b0
//     default:"https:unsplash.com/photos/white-building-photographt-MXbM1NrRqtI",
//     set:(v) => v===""? "https://unsplash.com/photos/white-building-photographt-MXbM1NrRqtI":v,
//   },
//   price: Number,
//   location: String
// });