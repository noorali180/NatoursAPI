const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

const app = require("../app");

console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(con.connections);
    console.log("DB connection successful");
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
});
