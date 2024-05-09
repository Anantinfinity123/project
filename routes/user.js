const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const { signUp, Login, Logout } = require("../controllers/user.js");

router
    .route("/signup")
    .get((req, res) => {
        res.render("./users/signup.ejs");
    })
    .post(wrapAsync(signUp)
);



router
    .route("/login")
    .get((req, res) => {
        res.render("users/login.ejs");
    })
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), Login);

router.get("/logout", Logout);

module.exports = router;
