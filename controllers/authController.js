const jwt = require("jsonwebtoken");
const { promisify } = require("util"); // utils is a built in library comes with node modules...

const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } =
    req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
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
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) verification of token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // { id: '662e761681580ac519c0437b', iat: 1714401503, exp: 1722177503 }
  // will catch errors in our global error handling middleware...i) invalid token, ii) token expired

  // 3) check if user still exists
  const currentUser = await User.findById(decodedToken.id);

  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );

  // 4) Check if user changed password after the JWT was issued (by using instance method on user schema)
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError("User recently changed password. Please login again!", 401)
    );
  }

  req.user = currentUser;
  // FINALLY GRANT ACCESS TO PROTECTED ROUTE...
  next();
});
