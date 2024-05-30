const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const factory = require("./../controllers/factoryHandler");
const catchAsync = require("../utils/catchAsync.js");

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });

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

// getting the nearby tours based on the location...

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius =
    unit === "mi"
      ? distance / 3963.2
      : unit === "km"
      ? distance / 6378.1
      : undefined;

  if (!lat || !lng)
    return next(
      new AppError(
        "please provide latitude and longitude in the format lat, lng",
        400
      )
    );

  if (!radius)
    return next(new AppError("please provide a valid unit for distances", 400));

  // Geospatial query.
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] /* in radians */ },
    },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// /distances/:latlng/unit/:unit
// /distances/34.111745,-118.113491/unit/mi

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier =
    unit === "mi" ? 0.000621371 : unit === "km" ? 0.001 : undefined;

  if (!lat || !lng)
    return next(
      new AppError(
        "please provide latitude and longitude in the format lat, lng",
        400
      )
    );

  if (!multiplier)
    return next(new AppError("please provide a valid unit for distances", 400));

  // in aggregation pipeline $geoNear should be first stage. it will be GeoJson Point ("near")
  // distanceField will contain the calculated distances.
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
