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
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
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

/////////////////////////////////////////////////////

const User = mongoose.model("User", userSchema);

module.exports = User;
