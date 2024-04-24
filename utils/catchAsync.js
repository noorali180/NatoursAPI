module.exports = (fn) => {
  return (req, res, next) => {
    // calling the function, passed from the route handler...
    fn(req, res, next).catch((err) => next(err));
  };
};
