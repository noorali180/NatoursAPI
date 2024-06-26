const fs = require("fs");

const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");

// function to get all the tours...
exports.getAllTours = async function (req, res) {
  // console.log(req.query);
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// function to get a single tour...
exports.getTour = async function (req, res) {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id});

    res.status(200).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      requestedTime: req.requestedTime,
      message: err,
    });
  }
};

// function to create a new tour...
exports.createTour = async function (req, res) {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

// function to update an existing tour...
exports.updateTour = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      requestedTime: req.requestedTime,
      message: err,
    });
  }
};

// function to delete a tour...
exports.deleteTour = async function (req, res) {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: {
        tour: deletedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      requestedTime: req.requestedTime,
      message: err,
    });
  }
};

/////////////////////////////// AGGREGATION PIPELINE ////////////////////////////////
exports.getTourStats = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      requestedTime: req.requestedTime,
      message: err,
    });
  }
};

// To calculate the busiest month of the given year...
exports.getMonthlyPlan = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      requestedTime: req.requestedTime,
      message: err,
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////

/*

//// MAKING OF QUERY...

// making a shallow copy of request params objects, so we can avoid mutating the original req.query object...
const queryObj = { ...req.query };
const excludedFields = ["page", "sort", "limit", "fields"];

// 1A). filtering

// query => 127.0.0.1:3000/api/v1/tours?difficulty=easy&price=500

// deleting the excluded params from our query if there is any.
excludedFields.forEach((field) => delete queryObj[field]);

// 1B). advanced filtering

// query => 127.0.0.1:3000/api/v1/tours?duration[gte]=5&price[lt]=400&difficulty=easy

// using find method to filter...
// from req.query ?duration[gte]=5 ==> {duration: {gte: 5}}
// find({duration: {$gte: 5}})

// converting queryObj to make the query suitable for using in find method to filter the data...
let queryStr = JSON.stringify(queryObj);
queryStr = JSON.parse(
  queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
);
// using regex expression for replacing the fields extra data (gte, gt, lte, lt) ==> field[extra data]

// if we await the initial query of Tour, so we cannot chain other queries to it, thats why we will make the query first and then consume/use it...
let query = Tour.find(queryStr);

// 2). Sorting

// query => 127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage (default = asc, -ve means desc)
// sort("-price ratingsAverage");
// (-ve sign means desc order, AND +ve sign means asc order)...

if (req.query.sort) {
  const sortBy = req.query.sort.split(",").join(" ");

  query = query.sort(sortBy);
  // query.sort("price ratingsAverage");
} else {
  query = query.sort("-createdAt").sort("_id");
}

// 3). Limiting the fields

// query => 127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage&fields=name,price,description

if (req.query.fields) {
  const fieldsStr = req.query.fields.split(",").join(" ");

  query = query.select(fieldsStr);
  // query.select({name price description}), thats how the select(project) query works...
} else {
  query = query.select("-__v");
  // -ve sign in front of the field means to exclude that field...
}

// NOTE: we can also add select property as {select: false}, in the schema to avoid a particular field from selecting or projecting...

// 4). Pagination

// query => 127.0.0.1:3000/api/v1/tours?page=1&limit=10

const page = +req.query.page || 1;
const limit = +req.query.limit || 100;
const skip = (page - 1) * limit;

query = query.skip(skip).limit(limit);

if (req.query.page) {
  const numTours = await Tour.countDocuments();
  if (skip > numTours) throw new Error("This page does not exist");
}

// page=1&limit=10, 1-10, page=2&limit=10, 11-20, page=3&limit=10, 21-30
// for page = 3 and limit = 10
// query.skip(20).limit(10)


// const tours = await Tour.find({duration: 5, difficulty: "easy"})
// Note: gives same output as above...
    // const tours = await Tour.find()
    //   .where("duration")
    //   .equals("5")
    //   .where("difficulty")
    //   .equals("easy");

*/
