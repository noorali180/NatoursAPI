// NOTE: All Express related stuff goes here, (i.e. middlewares, routers etc)...

const express = require("express");
const morgan = require("morgan");

// one separate router for each resource...
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

/////////////////////////// 1). MIDDLEWARES /////////////////////////////////////

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // middleware for logging request details,
}

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
