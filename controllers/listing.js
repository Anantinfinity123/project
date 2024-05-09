const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


module.exports.searchDestination = async (req, res) => {
    let destinations = req.query.destinations;
    const allListings = await Listing.find({location: destinations});
    res.render("listings/index.ejs", { allListings });
};


module.exports.newRoutes = async (req, res) => {
    // console.log(req.user);
    // isLoggedIn();
    res.render("listings/new.ejs");
};

module.exports.listingInfo = async (req, res) => {
    let {id} = req.params;
    let item = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",},}).populate("owner");
    if(!item) {
        req.flash("error", "Your Listing does not exist!");
        res.redirect("/listings");
    }
    console.log(item);
    res.render("listings/show.ejs", { item });
};


module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..", filename);
    // let {title, description, image, price, country, location} = req.body;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings"); 
    // console.log(listing);  
};


module.exports.editListing = async (req, res) => {
    // console.log(url, "..", filename);
    let { id } = req.params;
    let item = await Listing.findById(id);
    if(!item) {
        req.flash("error", "Your Listing does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = item.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { item, originalImageUrl });
};

module.exports.mapListing = async (req, res) => {
    let { id } = req.params;
    let item1 = await Listing.findById(id);
    res.render("layout/map.ejs", { item1 });
};


module.exports.updatingListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    // console.log(url, "..", filename);

    req.flash("success", "Your Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Your selected Listing is deleted!");
    res.redirect("/listings");
};