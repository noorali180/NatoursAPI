const User = require("./../models/userModel.js");

exports.getAllUsers = function (req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
};

exports.getUser = function (req, res) {
  res.status(500).json({ status: "failed", message: "route not defined" });
};

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
