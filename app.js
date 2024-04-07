// NOTE: All Express related stuff goes here, (i.e. middlewares, routers etc)...

// NOTE: Middlewares will run as they are, in order in the codebase...

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

// Handling the unhandled routes, e.g. routes which are not defined in server...(it will work because middlewares runs as order in the codebase)
// if the code reaches this stage which means the request response cycle is not yet completed, which also means that the requested url is not matched with any of the route we have defined...
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
