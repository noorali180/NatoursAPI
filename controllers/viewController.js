const Tour = require("./../models/tourModel");
const catchAsync = require("./../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res) => {
  // 1) get tours from database...
  const tours = await Tour.find();

  // 2) create template
  // 3) render the template on the basis of retrieved data.
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1) get tour from database
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  console.log(tour);

  // 2) create template
  // 3) render the page
  res.status(200).render("tour", {
    title: "The River Run",
    tour,
  });
});
