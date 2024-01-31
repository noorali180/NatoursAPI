const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

/////////////////////////// 1). MIDDLEWARES /////////////////////////////////////

app.use(morgan("dev")); // middleware for logging request details,

app.use(express.json());

// creating a custom middleware...
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

/////////////////////////////////////////////

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
