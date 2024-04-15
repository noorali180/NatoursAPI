const fs = require("fs");

const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");

// function to get all the tours...
exports.getAllTours = catchAsync(async (req, res, next) => {
  // console.log(req.query);
  //// For making & bettering the query...
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fieldsLimiting()
    .pagination();

  //// CONSUMING QUERY WITH AWAIT...
  const tours = await features.query;

  //// RESPONSE...
  res.status(200).json({
    status: "success",
    requestedTime: req.requestedTime,
    results: tours.length,
    data: {
      tours,
    },
  });
});

// function to get a single tour...
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({_id: req.params.id});

  res.status(200).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      tour,
    },
  });
});

// function to create a new tour...
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      tour: newTour,
    },
  });
});

// function to update an existing tour...
exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the new updated tour...
    runValidators: true, // validators should run again, compare with schema...
  });

  res.status(201).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      tour: updatedTour,
    },
  });
});

// function to delete a tour...
exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      tour: deletedTour,
    },
  });
});

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
