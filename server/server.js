// NOTE: entry point for the app, all server related things, database configurations, some error handlings, and environment variables goes there...

const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

/////////////////////////////////////////////////////////////////////

// Handling uncaught exceptions...
// UNCAUGHT EXCEPTIONS are programming errors, bugs or all errors which occurs in our synchronous code... such as accessing a variable before declaring it...
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

/////////////////////////////////////////////////////////////////////

const app = require("../app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection successful");
  });

/////////////////////////////////////////////////////////////////////

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
});

////////////////////////////////////////////////////////////

// Handling unhandled rejections which are outside the express app therefore our global error handling middleware will not catch it, such as wrong database password... (with the help of events and event listeners of node JS).

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);

  // it is better to use a callback function with server close function, which will wait until server finish all fetching (requests) and then exit the program, rather than exiting the program directly,
  server.close(() => {
    process.exit(1); // 1 means unhandled exception, 0 means success...
  });
});

//////////////////////////////////////////////////////////////////////
