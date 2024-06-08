const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util"); // utils is a built in library comes with node modules...

const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  console.log(`console.log token: ${token}`);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // expires will set the date and time of expiration of the cookie. (we can also use maxAge)
    // maxAge: process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production" ? true : false,
    // secure: if true then it will use encrypted path only which is https, (will not work in development if true, generates error)
    httpOnly: true,
    // httpOnly: provides cross site scripting security, client/browser can only read the cookie.
  });

  // remove password from output...
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

///////////////////////////////////////////////////////////////

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, role, password, passwordConfirm, passwordChangedAt } =
    req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    passwordConfirm,
    passwordChangedAt,
  });

  // secret key, should be at least of 32 characters long string for more powerful and secure security...

  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: "success",
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });

  createSendToken(newUser, 201, res);
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

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });

  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1). check if user exists. Based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email!", 404));
  }

  // 2). create a random reset password token (using built in library crypto)
  const resetToken = user.createPasswordResetToken(); // plain token not encrypted.
  await user.save({ validateBeforeSave: false });

  // 3). send to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 mins)",
      message,
      // html: "<h1>Reset your Password</h1>",
    });
  } catch (err) {
    console.log("error occurred in sending a mail", err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token (token coming from params)
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //note: if passwordResetExpires property is greater than now, then its not expired (its in the future)

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  user.save();

  // 3) Update changePasswordAt property for the user (whenever password is changed), we will do it using document middleware...

  // 4) Log the user in, send JWT

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });

  createSendToken(user, 200, res);
});

// func to update currently logged in user's password without resetting it...
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordOld, passwordNew, passwordConfirm } = req.body;
  // 1). Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2). Check if posted current password (old password) is correct
  if (!(await user.checkPassword(passwordOld, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3). If so, update password
  user.password = passwordNew;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 4). Log user in, send JWT
  createSendToken(user, 200, res);
});

///////////////////////////////////////////////////////////////////////

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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

  // we need user id for updating passwords and user data...
  req.user = currentUser;
  // FINALLY GRANT ACCESS TO PROTECTED ROUTE...
  next();
});

// middle ware function, which will accepts some arguments of roles of a user and return a function to wether restrict the user or allow it to access some routes or do some manipulations, e.g (deleting a tour) only user with "admin" or "lead-guide" role should be able to delete a tour.

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles-> ["admin", "lead-guide"], req.user.role = "user"
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      ); // 403 means--> forbidden
    }

    next();
  };
};
