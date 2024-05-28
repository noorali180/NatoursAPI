const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No tour found with that ID.", 404));
    }

    res.status(204).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No tour found with that ID.", 404));
    }

    res.status(201).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: {
        data: doc,
      },
    });

    next();
  });
