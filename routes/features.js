const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const Listing = require("../models/listing.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");


// trending fucntion
router.get(
  "/trending",
  wrapAsync(async (req, res) => {
    const trendingListings = await Listing.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviewDocs"
        }
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviewDocs" },

          recentReviews: {
            $size: {
              $filter: {
                input: "$reviewDocs",
                as: "review",
                cond: {
                  $gte: [
                    "$$review.createdAt",
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              "$views",
              { $multiply: ["$reviewCount", 3] },
              { $multiply: ["$recentReviews", 5] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: 10 }
    ]);

    res.render("listings/trending", { listings: trendingListings });
  })
);

//iconic cities
router.get(
  "/iconic",
  wrapAsync(async (req, res) => {
    const ICONIC_CITIES = [
      "Goa",
      "Mumbai",
      "Delhi",
      "Jaipur",
      "Manali",
      "Udaipur",
      "Bangalore"
    ];

    const iconicListings = await Listing.find({
      city: { $in: ICONIC_CITIES }
    }).sort({ createdAt: -1 });

    res.render("listings/index", { allListings: iconicListings });
  })
);

// mountains 
router.get(
  "/mountains",
  wrapAsync(async (req, res) => {
    const mountainListings = await Listing.find({
      categories: "mountains"
    });

    res.render("listings/index", { allListings: mountainListings });
  })
);

// castles
router.get(
  "/castles",
  wrapAsync(async (req, res) => {
    const castleListings = await Listing.find({
      categories: "castles"
    });

    res.render("listings/index", { allListings: castleListings });
  })
);

//amazing-pools
router.get(
  "/amazing-pools",
  wrapAsync(async (req, res) => {
    const poolListings = await Listing.find({
      categories: "amazing-pools"
    });

    res.render("listings/index", { allListings: poolListings });
  })
);

//camping
router.get(
  "/camping",
  wrapAsync(async (req, res) => {
    const campingListings = await Listing.find({
      categories: "camping"
    });

    res.render("listings/index", {
      allListings: campingListings
    });
  })
);

// farms
router.get(
  "/farms",
  wrapAsync(async (req, res) => {
    const farmsListings = await Listing.find({
      categories: "farms"
    });

    res.render("listings/index", { allListings: farmsListings });
  })
);


// Arctic
router.get(
  "/arctic",
  wrapAsync(async (req, res) => {
    const ArticListing= await Listing.find({
      categories: "arctic"
    });
    res.render("listings/index", { allListings: ArticListing });
  })
);

//Domes
router.get(
  "/domes",
  wrapAsync(async (req, res) => {
    const DomesListing= await Listing.find({
      categories: "domes"
    });
    res.render("listings/index", { allListings: DomesListing });
  })
);

//Boats
router.get(
  "/boats",
  wrapAsync(async (req, res) => {
    const BoatsListings= await Listing.find({
      categories: "boats"
    });
    res.render("listings/index", { allListings: BoatsListings });
  })
);