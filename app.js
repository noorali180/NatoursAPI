// NOTE: All Express related stuff goes here, (i.e. middlewares, routers etc)...

// NOTE: Middlewares will run as they are, in order in the codebase...

const express = require("express");
const morgan = require("morgan");

// one separate router for each resource...
const AppError = require("./utils/appError")
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
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
  // passing a error in next callback function, express will know that it is an error, it will skip all the other middlewares in the stack and go straight to the error handling middleware...
});

// ERROR HANDLING (with global error handling middleware)

// express work with the error handling middleware to give us easy error handling out of the box, basically the goal is to define a global error handling middleware which will catch all the Errors coming from all over the application... either it is a operational error or programming error...

// Step 1: create an error handling middleware
// Step 2: create an error so this function will get called

// GLOBAL ERROR HANDLING FUNCTION
app.use((err, req, res, next) => {
  // 4 parameters will help express to identify that it is an error handling middleware, 1st parameter will always be error...
  err.statusCode = err.statusCode || 500; // 500 -> internal server error
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
