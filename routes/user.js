const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

// SIGNUP FORM
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
  try {
    console.log("SIGNUP DATA 👉", req.body);
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        console.log("LOGIN ERROR ❌", err.message);
        req.flash("error", "Auto login failed. Please login manually.");
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


// router.post("/signup", async (req, res) => {
//   try {
//     console.log("SIGNUP DATA 👉", req.body);

//     const { username, email, password } = req.body;

//     const user = new User({ username, email });
//     const registeredUser = await User.register(user, password);

//     req.login(registeredUser, (err) => {
//       console.log("LOGIN ERROR ❌", err.message);
//       req.flash("error", "Auto login failed. Please login manually.");
//       return res.redirect("/login");
//     });

//   } catch (err) {
//     console.log("SIGNUP ERROR ❌", err.message);
//     req.flash("error", err.message);
//     res.redirect("/signup");
//   }
// });
// signup
// router.post("/signup", async (req, res) => {
//   try {
//     console.log("SIGNUP DATA 👉", req.body);
//     const { username, email, password } = req.body;
    
//     const newUser = new User({ username, email });
//     const registeredUser = await User.register(newUser, password);

//     req.login(registeredUser, (err) => {
//       if (err) {
//         console.log("LOGIN ERROR ❌", err.message);
//         req.flash("error", "Login failed after signup");
//         return res.redirect("/login");
//       }

//       req.flash("success", "Welcome to Wanderlust!");
//       res.redirect("/listings");
//     });

//   } catch (e) {
//     console.log("SIGNUP ERROR ❌", e.message);
//     req.flash("error", e.message);
//     res.redirect("/signup");
//   }
// });

// // LOGIN
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
  async(req, res) => {
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
