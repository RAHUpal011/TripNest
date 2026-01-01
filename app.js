
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");

const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log("✅ MongoDB CONNECTED SUCCESSFULLY"))
  .catch(err => console.log(err));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  client: mongoose.connection.getClient(), // ✅ FIX
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 *60 * 60 * 1000,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});
