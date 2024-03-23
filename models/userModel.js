const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"] },
  age: { type: Number, required: [true, "age is required"] },
});

const User = mongoose.model("User", userSchema);

exports.default = User;
