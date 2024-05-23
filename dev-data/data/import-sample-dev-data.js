const fs = require("fs");
const dotenv = require("dotenv").config();

const mongoose = require("mongoose");

const Tour = require("./../../models/tourModel");
const Review = require("./../../models/reviewModel");
const User = require("./../../models/userModel");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection successful");
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));

async function importData() {
  try {
    await Tour.create(tours);
  } catch (err) {
    console.log(err);
  }
  process.exit();
}

async function deleteData() {
  try {
    await Tour.deleteMany();
  } catch (err) {
    console.log(err);
  }
  process.exit();
}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
