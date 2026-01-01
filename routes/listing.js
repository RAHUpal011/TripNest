const express = require("express");
const router = express.Router();
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
}));

// NEW
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// SHOW
router.get("/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
}));

// CREATE
router.post(
  "/",
  isLoggedIn,
  validateListing,
  upload.single("listing[image]"),
  wrapAsync(async (req, res) => {

    // ✅ SAFE TOKEN CHECK
    if (!process.env.MAPBOX_TOKEN) {
      throw new ExpressError("Mapbox access token missing", 500);
    }

    // ✅ Create client ONLY when needed
    const geocodingClient = mbxGeocoding({
      accessToken: process.env.MAPBOX_TOKEN,
    });

    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    if (geoResponse.body.features.length > 0) {
      listing.geometry = geoResponse.body.features[0].geometry;
    }

    await listing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/edit", { listing });
}));

// UPDATE
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  upload.single("listing[image]"),
  wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body.listing,
      { new: true }
    );

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// DELETE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
}));

module.exports = router;
