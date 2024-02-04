const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf8")
);

// exports.checkId = function (req, res, next, val) {
//   if (+req.params.id > tours.length)
//     return res.status(404).json({
//       status: "failed",
//       message: "INVALID_ID",
//     });
// };

// custom middleware to check if there is name or price available in new post, whenever a post req is made...
exports.checkNewTour = function (req, res, next) {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: "failed",
      message: "there is no name or price",
    });

  next();
};

// function to get all the tours...
exports.getAllTours = function (req, res) {
  console.log(req.body);
  res.status(200).json({
    status: "success",
    message: "successfully fetched the tours",
    requestedTime: req.requestedTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

// function to get a single tour...
exports.getTour = function (req, res) {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour.id === id);

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
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err)
        res.status(404).json({
          status: "fail",
          message: "failed to update the file",
          requestedTime: req.requestedTime,
        });
    }
  );

  res.status(200).json({
    status: "success",
    message: "successfully added into the tours",
    requestedTime: req.requestedTime,
    data: {
      tours,
    },
  });
};

// function to update an existing tour...
exports.updateTour = function (req, res) {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour.id === id);

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
  const tourIndex = tours.findIndex((tour) => tour.id === id);

  if (tourIndex === -1)
    return res.status(404).json({
      status: "fail",
      message: "INVALID_ID",
      requestedTime: req.requestedTime,
    });

  tours.splice(tourIndex, 1);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err)
        res
          .status(404)
          .json({ status: "fail", message: "failed to update the file" });
    }
  );

  res.status(204).json({
    status: "success",
    message: "successfully deleted the tour",
    requestedTime: req.requestedTime,
    data: { tourIndex },
  });
};
