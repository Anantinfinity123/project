const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");
// const { reviewSchema } = require("./schema.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    image: {
        // type: String,
        // default: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        // set: (v) => v === "" ? "https://unsplash.com/photos/a-view-of-the-ocean-from-inside-a-cave-qqDO3xe1g0M" : v,
        url: String,
        filename: String,
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        maxLength: 25,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    // geometry: {
    //     type: {
    //         type: String,
    //         enum: ['Point'],
    //         required: true
    //     },
    //     coordinates: {
    //         type: [Number],
    //         required: true
    //     }
    // }
    // category: {
    //     type: String,
    //     // enum: ["mountains", "Trending", "Rooms", "Beach", "Camping" ,"Farms", "Temple", "Theme park", "Arctic"]
    // }

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;