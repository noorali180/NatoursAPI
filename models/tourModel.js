const mongoose = require("mongoose");

// to do CRUD operations we need to create a mongoose model, and for model creation we need a schema...
const tourSchema = new mongoose.Schema({
  name: {
    // we can simply type the name of type of field, but with specifying type with object we can add some extra things in it, like required, unique, default and many more....
    type: String,
    // required: [true/false, "error_message"] --> basically it is a validator...
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must have a summary"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

// Tour model, model name's first letter should always be capital, it is a convention...
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
