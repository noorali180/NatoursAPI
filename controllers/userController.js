const User = require("../models/userModel.js");
const AppError = require("../utils/appError.js");
const catchAsync = require("../utils/catchAsync.js");
const factory = require("./../controllers/factoryHandler");

const filterObjFields = (obj, ...includedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (includedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = function (req, res, next) {
  // in this function we will set the user id, as a request param so that we can get that the current user data from factory handler getOne() => which assumes that the user id will come as a request param.
  req.params.id = req.user.id;
  next();
};

// route to update user data only, not passwords (we have another route and handler for updating the current password of the user.)
exports.updateMe = catchAsync(async function (req, res, next) {
  // 1). If data about password is posted to body then generate error and return
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword."
      ),
      400
    );
  }

  // 2). filtering the req.body object fields, so no one can change the confidential fields, (i.e. role, passwordResetToken, and others)
  // for now we can only update "name" and "email" fields.
  const filteredObj = filterObjFields(req.body, "name", "email");

  // 3). update user document in DB
  const userID = req.user.id;
  const updatedUser = await User.findByIdAndUpdate(userID, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});

// func to delete a current user, which is logged in, basically not deleting permanently from database, but temporarily marking it inactive.
exports.deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

//////////////////////////////////////////////////////////////////////////////

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// do not update password with this route, instead use forgot password route...
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
