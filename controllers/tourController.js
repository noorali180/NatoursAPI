const fs = require("fs");

const Tour = require("./../models/tourModel");

// function to get all the tours...
exports.getAllTours = async function (req, res) {
  try {
    const tours = await Tour.find({});

    res.status(200).json({
      status: "success",
      requestedTime: req.requestedTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Cannot fetch Tours!",
    });
  }
};

// function to get a single tour...
exports.getTour = function (req, res) {
  const id = +req.params.id;
  const tour = null;

  if (!tour)
    return res.status(404).json({
      status: "fail",
      message: "INVALID_ID",
      requestedTime: req.requestedTime,
    });

  res.status(201).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      tour,
    },
  });
};

// function to create a new tour...
exports.createTour = async function (req, res) {
  try {
    const newTour = await Tour.create(req.body);
    console.log(newTour);

    res.status(201).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: "Invalid Data!" });
  }
};

// function to update an existing tour...
exports.updateTour = function (req, res) {
  const id = +req.params.id;
  const tour = null;

  if (!tour)
    return res.status(404).json({
      status: "fail",
      message: "INVALID_ID",
      requestedTime: req.requestedTime,
    });

  res.status(203).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: {
      tour: "updated tour here",
    },
  });
};

// function to delete a tour...
exports.deleteTour = function (req, res) {
  const id = +req.params.id;
  const tourIndex = -1;

  if (tourIndex === -1)
    return res.status(404).json({
      status: "fail",
      message: "INVALID_ID",
      requestedTime: req.requestedTime,
    });

  res.status(204).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: { tourIndex },
  });
};
