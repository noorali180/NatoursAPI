const AppError = require("../utils/appError.js");
const catchAsync = require("../utils/catchAsync.js");
const User = require("./../models/userModel.js");

const filterObjFields = (obj, ...includedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (includedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = function (req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
};

exports.getUser = function (req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
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

exports.createUser = async function (req, res) {
  try {
    const newUser = await User.create(req.body);
    console.log(newUser);
    res.status(200).json({ status: "success", data: { user: newUser } });
  } catch (err) {
    res.status(400).json({ status: "failed", message: err });
  }
};

exports.updateUser = function (req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
};

exports.deleteUser = function (req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
};
