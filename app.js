const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

const app = express();

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf8")
);

/////////////////////////// 1). MIDDLEWARES /////////////////////////////////////

app.use(morgan("dev")); // middleware for logging request details,

app.use(express.json());

// creating a custom middleware...
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();

  next();
});

/////////////////////////// 2). ROUTE HANDLERS /////////////////////////////////////

// function to get all the tours...
function getAllTours(req, res) {
  res.status(200).json({
    status: "success",
    message: "successfully fetched the tours",
    requestedTime: req.requestedTime,
    results: tours.length,
    data: {
      tours,
    },
  });
}

// function to get a single tour...
function getTour(req, res) {
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
}

// function to create a new tour...
function createTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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
}

// function to update an existing tour...
function updateTour(req, res) {
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
}

// function to delete a tour...
function deleteTour(req, res) {
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
    `${__dirname}/dev-data/data/tours-simple.json`,
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
}

function getAllUsers(req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
}

function getUser(req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
}

function createUser(req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
}

function updateUser(req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
}

function deleteUser(req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
}

/////////////////////////// 3). ROUTES /////////////////////////////////////

// using a router means to create a sub / mini application inside the application by, mounting the middleware Router to the specific pahts... according to defined resources

const toursRouter = express.Router();
const usersRouter = express.Router();

toursRouter.route("/").get(getAllTours).post(createTour);
toursRouter.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

usersRouter.route("/").get(getAllUsers).post(createUser);
usersRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

/////////////////////////// 4). SERVER /////////////////////////////////////

const port = 3000;

app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
});
