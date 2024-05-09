// NOTE: All Express related stuff goes here, (i.e. middlewares, routers etc)...

// NOTE: Middlewares will run as they are, in order in the codebase...

const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// one separate router for each resource...
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

/////////////////////////// 1). MIDDLEWARES /////////////////////////////////////

// set http security headers...
app.use(helmet());

// logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // middleware for logging request details,
}

// prevents an IP to make too many requests, which eventually helps in preventing the brute force attack and DOS attacks... (security measure)
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per window...
  windowMs: 60 * 60 * 1000, // 60 minutes...
  // 100 requests each IP in 1 hour / 60 minutes,
  message: "Too many requests from this IP, please try again in an hour!",
  // error message if requests exceeds the limit specified
});

app.use("/api", limiter); // will apply to all routes starting with /api

// to parse data from cookie...
app.use(cookieParser());

// body parser, reading data from body into req.body...
app.use(express.json({ limit: "10kb" }));

// Serving static files...
app.use(express.static(`${__dirname}/public`));

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

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  // passing a error in next callback function, express will know that it is an error, it will skip all the other middlewares in the stack and go straight to the error handling middleware...
});

// ERROR HANDLING (with global error handling middleware)

// express work with the error handling middleware to give us easy error handling out of the box, basically the goal is to define a global error handling middleware which will catch all the Errors coming from all over the application... either it is a operational error or programming error...

// Step 1: create an error handling middleware
// Step 2: create an error so this function will get called

// GLOBAL ERROR HANDLING FUNCTION
app.use(globalErrorHandler);

module.exports = app;
