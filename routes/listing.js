const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router
    .route("/")
    .get(wrapAsync(listingController.index))
    // .post(upload.single("listing[image]"), (req, res) => {
    //     res.send(req.file);
    // });
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing)
    );
    

router.get("/new", isLoggedIn, wrapAsync(listingController.newRoutes));


router.get("/search", wrapAsync(listingController.searchDestination));


router
    .route("/:id")
    .get(wrapAsync(listingController.listingInfo))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updatingListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));




router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

router.get("/:id/map", wrapAsync(listingController.mapListing));


module.exports = router;