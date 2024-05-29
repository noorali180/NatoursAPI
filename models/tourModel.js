const mongoose = require("mongoose");
// const User = require("./userModel");

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
      maxLength: [40, "A tour name must have less or equal then 40 characters"],
      minLength: [10, "A tour name must have more or equal then 10 characters"],
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
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is not valid",
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.666666->46.66666->47->4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // if the validator function returns false  then there is an error, and error message will be printed, if it returns true then there is no error...
        // NOTE: this function will only work on creating a new tour (i.e. this --> points to the newly created object) BUT it will not work on updating a existing tour... && {VALUE} --> will contain the current value of the object...
        // there are also libraries for custom validators in npm, we can just put these functions right there... for validations... (e.g.: validator.js)
        // validate: [validator.function, "error_message"]
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
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
    // for query middleware example...
    secretTour: {
      type: Boolean,
      default: false,
    },
    // location GEOJson...
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    // location embedded document...
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],

    // embedding the users / guides...
    //guides: Array, // NOTE: will use document middleware to fetch and embed the data from given id's through query.

    // child referencing the users / guides...
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User", // reference to the User Model...
      },
      // NOTE: we will use the query middleware to populate the data...
    ],

    // NOTE: we need each corresponding review about the tour in tour model, we can do it with child referencing but that is not the ideal way, so we will use virtual populate (virtually populating the data without persisting it in the DB).
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// INDEXES
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// ({schemaDefinition}, {schemaOptions})

// In Mongoose, virtual properties are properties that you can define on your schema but that do not get persisted to the database. Instead, they are computed properties based on other fields in your document or some other logic.
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// virtual populate (reviews)
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour", // id of the tour in other collection (Review).
  localField: "_id", // id of the tour in the local collection (Tour).
});

////////////////// MIDDLEWARES IN MONGOOSE ////////////////////////

// there are two types of middleware functions or hook functions, use in middlewares,
// i) Pre Middleware (runs before the specified action triggers)
// ii) Post Middleware (runs after the specified action triggers)

// 1). DOCUMENT MIDDLEWARE
/*
tourSchema.pre("save", function (next) {
  console.log(this); // console logs the saved document...

  next();
});
// runs before or after .save(),and .create()

tourSchema.post("save", function (doc, next) {
  console.log(doc);

  next();
});
*/

// middleware for embedding guides data to tours collection...
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });
// NOTE: it is not right to embed such data which can change regularly,

// 2). QUERY MIDDLEWARE

// this middleware will run before every find query...
// tourSchema.pre("find", function (next) {
tourSchema.pre(/^find/, function (next) {
  // Note:  "/^find/" --> it is a regular expression which will cater all the find queries, such as find(), findById(), findOneAndUpdate() etc...

  // console.log(this); // this will point to the query object...

  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

tourSchema.pre(/^find/, function (next) {
  // this.populate("guides");
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds :)`);
  // console.log(docs); // docs will contain all the documents which have matched the query...

  next();
});

// 3). AGGREGATION MIDDLEWARE

tourSchema.pre("aggregate", function (next) {
  // console.log(this); // --> will point to the aggregation object...
  console.log(this.pipeline()); // this will give the complete pipeline of aggregation object [array]...

  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });

  next();
});

////////////////////////////////////////////////////////////////////////////

// Tour model, model name's first letter should always be capital, it is a convention...
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
