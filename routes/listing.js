const express = require("express");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken  = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js")
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})


// inddex route
router.get("/",  wrapAsync(async(req , res)=>{
  const allListings = await Listing.find({});
  res.render("listings/index" , {allListings})
}));

// new route
router.get("/new" , isLoggedIn, (req , res)=>{
  res.render("listings/new");
});




// show Route
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  listing.views = (listing.views || 0) + 1;
  await listing.save();

  res.render("listings/show", { listing });
}));

//create new route
router.post("/" ,isLoggedIn,validateListing,  upload.single('listing[image]') , wrapAsync(async(req, res)=>{
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 2
  }).send()
  
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url , filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings")
  })
);

// Edit Route
router.get("/:id/edit",  isLoggedIn , isOwner, wrapAsync( async(req ,res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error" , "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing , originalImageUrl});
}));

// update Route
router.put("/:id",
  isLoggedIn,
  isOwner,
  validateListing, 
  upload.single("listing[image]"),
  wrapAsync(async(req, res) => {

    console.log("UPDATE BODY:", req.body); // IMPORTANT TESTING
    const { id } = req.params;
    delete req.body.listing.geometry;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    if (req.file) {
      listing.image = { url: req.file.path, filename: req.file.filename };
      await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

// delete Route
router.delete("/:id" , isLoggedIn, isOwner, wrapAsync( async(req, res)=>{
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success" , "Listing was Deleted!")
  res.redirect("/listings")
}));

module.exports = router;