const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  // secret key, should be at least of 32 characters long string for more powerful and secure security...
  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1). check if email and password exist
  if (!email || !password)
    return next(new AppError("Please provide email and password!", 400));

  // 2). check if user exists && password is correct
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401)); // 401 means unauthorized.
  }

  // 3). if everything is ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

// this will be middleware function and will run before the execution of route handler e.g (getAllTours)
exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token pass in headers && check of it's true
  let token;
  // header -> authentication: Bearer "t...o.k..e....n"
  if (
    req.headers.authentication &&
    req.headers.authentication.startsWith("Bearer")
  ) {
    token = req.headers.authentication.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  console.log(token);
  // 2) verification of token

  // 3) check if user still exists

  // 4) Check if user changed password after the JWT was issued
  next();
});
