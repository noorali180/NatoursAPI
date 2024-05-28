const Tour = require("../models/tourModel");
// const AppError = require("../utils/appError");
const factory = require("./../controllers/factoryHandler");
const catchAsync = require("../utils/catchAsync.js");

exports.getAll = factory.getAll(Tour);
exports.getOne = factory.getOne(Tour, { path: "reviews" });

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

/////////////////////////////// AGGREGATION PIPELINE ////////////////////////////////
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        // it is groupBY identifier which will group the data based on that field...
        // _id: "null",
        // _id: "$difficulty",

        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: {
          $avg /*mathematical field to calc average*/:
            "$ratingsAverage" /*field name in db*/,
        },
        avgPrice: {
          $avg: "$price",
        },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: -1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: "EASY" },
    //   },
    // },
  ]);

  res.status(200).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      stats,
    },
  });
});

// To calculate the busiest month of the given year...
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numOfTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numOfTours: -1 },
    },
    // {
    //   $limit: 2,
    // },
  ]);

  res.status(200).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      plan,
    },
  });
});
