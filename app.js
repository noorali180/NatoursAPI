const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// middleware to send data through post request,
/**
 * middleware sits between req and res, to do something after req gets something, can modify the incoming req data...
 */
// app.use(express.json());
app.use(bodyParser.json());

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
    results: tours.length,
    data: {
      tours,
    },
    error: "error",
  });
});

// route to handle post request for tours data...
app.post("api/v1/tours", (req, res) => {
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);

  // // adding the new tour to tours array...
  // tours.push(newTour);
  // // writing the new tour to tours file (in database later)
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify({ id: tourId, newTour }),
  //   (err) => {
  //     console.log(err.message);
  //   }
  // );
  console.log(req.body);

  res.status(200).send("got a post request");
});

const port = 3000;

app.listen(port, () => {
  console.log(`app is listening on port ${port}.`);
});
