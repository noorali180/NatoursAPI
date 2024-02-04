const { Schema, model } = require("mongoose");

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

// Tour model, model name's first letter should always be capital, it is a convention...
const Tour = model("Tour", tourSchema);

exports.default = Tour;
