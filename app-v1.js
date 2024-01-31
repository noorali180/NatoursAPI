const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

const app = express();

/////////////////////////// 1). MIDDLEWARES /////////////////////////////////////

app.use(morgan("dev")); // middleware for logging request details,

// middleware to send data through post request,
/**
 * middleware sits between req and res, to do something after req gets something, can modify the incoming req data...
 */
// NOTE: use function is used to add middleware to middleware stack... we can create our own custom middlewares and can add them to middleware stack easily by using use function...
app.use(express.json());

// creating a custom middleware...
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();

  next();
});

// // send a get request to particular port when specified route is hit...
// app.get("/", (req, res) => {
//   res.status(200).send("this is the home page...");

//   // NOTE: we can also use json() method to get/post json data from server, which automatically sets the "content-type" to "application/json" in header...
//   // res
//   //   .status(200)
//   //   .json({ message: 'this is json data', app: 'from natours app' });
// });

// // sends a post request to particular port when specified route is hit...
// app.post("/", (req, res) => {
//   res.send("now you can do a post request to server...");
// });

// reading data from local file, later data will come from the database...
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf8")
);

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

/////////////////////////// 3). ROUTES /////////////////////////////////////

/*

// route to handle get request for tours data...
app.get("/api/v1/tours", getAllTours);

// getting a single tour by id, using req.params...
app.get("/api/v1/tours/:id", getTour);
// we cans also do, "/api/v1/tours/:id/:some_other/:another_one"...
// then, req.params = {id: "", some_other: "", another_one: ""}
// we can also use optional parameters... "/api/v1/tours/:id/:some_other?/:another_one?"...

// route to handle post request for tours data...
app.post("/api/v1/tours", createTour);

// route to handle a patch request...
app.patch("/api/v1/tours/:id", updateTour);

// route to handle a delete request...
app.delete("/api/v1/tours/:id", deleteTour);

*/

// NOTE: we can also chain the routes, by using route() from express, which basically acts as a middleware...

app.route("/api/v1/tours").get(getAllTours).post(createTour);
app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

/////////////////////////// 4). SERVER /////////////////////////////////////

const port = 3000;

app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
});
