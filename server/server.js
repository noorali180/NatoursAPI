const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

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

// to do CRUD operations we need to create a mongoose model, and for model creation we need a schema...
const tourSchema = new Schema({
  name: {
    // we can simply type the name of type of field, but with specifying type with object we can add some extra things in it, like required, unique, default and many more....
    type: String,
    // requirted: [true/false, "error_message"] --> bascially it is a validator...
    required: [true, "A tour must have a name"],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
});

const Tour = model("Tour", tourSchema);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
});
