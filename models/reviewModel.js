const mongoose = require("mongoose");

const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // parent referencing (Tour)
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },

    // parent referencing (User)
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

///////////////////// STATIC FUNCTIONS //////////////////////////////
// We can call static functions directly on model..

// this function will take tour ID and aggregate on the basis of it and calculates the average rating and no. of ratings.
reviewSchema.statics.calcAvgRatings = async function (tourId) {
  // in this function "this" keyword will point on the current document
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // now we need to update the ratings quantity and no. of ratings in the Tour document...
  // ratingsQuantity, ratingsAverage
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRatings,
    ratingsAverage: stats[0].avgRating,
  });
};

// NOTE: we have to run this function whenever a new rating is saved or an existing review is deleted, we can do it by using document middleware...

///////////////////// MIDDLEWARES //////////////////////////////

// 1) DOCUMENT MIDDLEWARE
reviewSchema.post("save", function () {
  // the static function can be called upon the Model (Review Model)...
  // Review.calcAvgRatings(this.tour); "this" will points to the current doc.

  // this.constructor => this points the Model.

  this.constructor.calcAvgRatings(this.tour);
});

// 2) QUERY MIDDLEWARE

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });

  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
