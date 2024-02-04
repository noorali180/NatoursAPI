const fs = require("fs");

const Tour = require("./../models/tourModel");

// function to get all the tours...
exports.getAllTours = function (req, res) {
  res.status(200).json({
    status: "success",
    message: "successfully fetched the tours",
    requestedTime: req.requestedTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
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
    message: "successfully fetched the tour",
    requestedTime: req.requestedTime,
    data: {
      tour,
    },
  });
};

// function to create a new tour...
exports.createTour = function (req, res) {
  res.status(200).json({
    status: "success",
    message: "successfully added into the tours",
    requestedTime: req.requestedTime,
    data: {
      // tours,
    },
  });
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
    message: "successfully updated the tour",
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
    message: "successfully deleted the tour",
    requestedTime: req.requestedTime,
    data: { tourIndex },
  });
};
