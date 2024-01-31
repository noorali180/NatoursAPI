const fs = require("fs");
const express = require("express");

const app = express();

// middleware to send data through post request,
/**
 * middleware sits between req and res, to do something after req gets something, can modify the incoming req data...
 */
app.use(express.json());

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

// route to handle get request for tours data...
app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "successfully fetched the tours",
    results: tours.length,
    data: {
      tours,
    },
  });
});

// getting a single tour by id, using req.params...
app.get("/api/v1/tours/:id", (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour.id === id);

  if (!tour)
    return res.status(404).json({
      status: "fail",
      message: "INVALID_ID",
    });

  res.status(200).json({
    status: "success",
    message: "successfully fetched the tour",
    data: {
      tour,
    },
  });
});
// we cans also do, "/api/v1/tours/:id/:some_other/:another_one"...
// then, req.params = {id: "", some_other: "", another_one: ""}
// we can also use optional parameters... "/api/v1/tours/:id/:some_other?/:another_one?"...

// route to handle post request for tours data...
app.post("/api/v1/tours", (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.appendFile(
    `${__dirname}/dev-data/data/tours-simple`,
    JSON.stringify(newTour),
    (err) => {
      if (err)
        res
          .status(404)
          .json({ status: "fail", message: "failed to update the file" });
    }
  );

  res.status(201).json({
    status: "success",
    message: "successfully added into the tours",
    data: {
      tours,
    },
  });
});

// route to handle a patch request...
app.patch("/api/v1/tours/:id", (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour.id === id);

  if (!tour)
    return res.status(404).json({ status: "fail", message: "INVALID_ID" });

  res.status(201).json({
    status: "success",
    message: "successfully updated the tour",
    data: {
      tour: "updated tour here",
    },
  });
});

//////////////////////////////////////

const port = 3000;

app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
});
