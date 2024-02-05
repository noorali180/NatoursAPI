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
    res.status(404).json({
      status: "fail",
      message: "Cannot fetch Tours!",
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
exports.updateTour = async function (req, res) {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: {
        tour: updatedTour,
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

// function to delete a tour...
exports.deleteTour = async function (req, res) {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(203).json({
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
