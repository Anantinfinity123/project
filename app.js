if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
// console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");

const port = 8080;

const dbUrl = process.env.ATLASDB_URL;
main()
    .then(() => {
        console.log("connected to the db");
    }).catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("views engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(cookieParser());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in mongo session store", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }, 
};

// app.get("/", (req, res) => {
//     res.send("Hii, I am root");
// });



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
    // console.log(res.locals.success);
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "Delta-student",
//     });

//     let registeredUser = await User.register(fakeUser, "HelloWorld");
//     res.send(registeredUser);
// });

// const checkToken = (req, res, next) => {
//     let { token } = req.query;
//     if (token === "giveacess") {
//         next();
//     }
//     throw new ExpressError(401, "ACESS DENIED!");
// };

// Logger - like morgan
app.use((err, req, res, next) => {
    console.log("_________--error--_________");
    // req.time = new Date(Date.now()).toString();
    // console.log(req.method, req.time, req.path, req.hostname);
    let {status =500, message= "Some error occurrred"} = err;
    res.status(status).send(message);
    // console.log("this is after 1st next");
});

// app.use((err, req, res, next) => {
//     console.log("I am the 2nd middleware");
//     next(err);
//     // console.log("this is after 2nd next");
// });

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log(res);
//     res.send("sucessful testing");
       
// });

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page not found"));
// });

app.use((err, req, res, next) => {
    let {statusCode=500, message="something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs", { err });
    console.log(err);
});

app.listen(port, () => {
    console.log(`Server is listening at the port ${port}`);
});