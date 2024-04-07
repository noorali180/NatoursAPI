module.exports = (err, req, res, next) => {
  // 4 parameters will help express to identify that it is an error handling middleware, 1st parameter will always be error...
  err.statusCode = err.statusCode || 500; // 500 -> internal server error
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
