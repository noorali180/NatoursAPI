const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// send error in development...
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// send error in production...
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // this variable is accessible only with our own Error class errors, not with MongoDB or Mongoose errors...

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown errors: don't leak error details
  } else {
    // 1) Log the error
    console.error("Error 💥", err); // there are other npm libraries for better logging errors...

    // 2) Send a generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  // 4 parameters will help express to identify that it is an error handling middleware, 1st parameter will always be error...
  err.statusCode = err.statusCode || 500; // 500 -> internal server error
  err.status = err.status || "error";

  // res.status(err.statusCode).json({
  //   status: err.status,
  //   message: err.message,
  // });

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    // 1) casting error (invalid id)
    if (error.name === "CastError") error = handleCastErrorDB(error);

    sendErrorProd(error, res);
  }
};
