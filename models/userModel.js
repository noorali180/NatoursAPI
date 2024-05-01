const mongoose = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please tell us your name!"] },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, "Please confirm your password"],
    validate: {
      // this only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
});

// Encryption and Decryption of passwords (using )
// in document middleware, time before saving any document.
userSchema.pre("save", async function (next) {
  // if password is not modified then return from the function...
  if (!this.isModified("password")) next();

  // else run this code...

  // using bcrypt hashing algorithm for encryption (to avoid brute force attacks from hackers)...
  // this algorithm will first solve and then hash our password to make it really strong. (also adding a random string at the end to avoid same hash for two different decryptions)

  // encrypting (hashing) the password using bcryptjs library, with 12
  this.password = await bcrypt.hash(this.password, 12);

  // deleting passwordConfirm field from DB... (because we need it only for validation and not for encryption)
  this.passwordConfirm = undefined;

  next();
});

// candidatePassword --> not encrypted, simple
// userPassword --> encrypted coming from database
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// func to check password is changed after the issuance of JWT token or not??
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()) / 1000;

    if (JWTTimestamp < changedTimeStamp) return true; // 100 < 300 --> password changed true
  }

  return false; // if password is not changed then return false (by default)
};

/////////////////////////////////////////////////////

const User = mongoose.model("User", userSchema);

module.exports = User;
