const mongoose = require("mongoose");

// to do CRUD operations we need to create a mongoose model, and for model creation we need a schema...
const tourSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ({schemaDefinition}, {schemaOptions})

// In Mongoose, virtual properties are properties that you can define on your schema but that do not get persisted to the database. Instead, they are computed properties based on other fields in your document or some other logic.
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

////////////////// MIDDLEWARES IN MONGOOSE ////////////////////////

// there are two types of middleware functions or hook functions, use in middlewares,
// i) Pre Middleware (runs before the specified action triggers)
// ii) Post Middleware (runs after the specified action triggers)

// 1). DOCUMENT MIDDLEWARE
// tourSchema.pre("save", function (next) {
//   console.log(this); // console logs the saved document...

//   next();
// });
// runs before or after .save(),and .create()

// tourSchema.post("save", function (doc, next) {
//   console.log(doc);

//   next();
// });

// 2). QUERY MIDDLEWARE

////////////////////////////////////////////////////////////////////////////

// Tour model, model name's first letter should always be capital, it is a convention...
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
