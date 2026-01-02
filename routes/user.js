const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

// SIGNUP FORM
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP DATA 👉", req.body);

    const { username, email, password } = req.body;

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        console.log("AUTO LOGIN ERROR ❌", err.message);
        req.flash("error", "Signup successful, please login.");
        return res.redirect("/login");
      }

      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });

  } catch (e) {
    console.log("SIGNUP ERROR ❌", e.message);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});


router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);


// LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err){
      return next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
});

module.exports = router;
