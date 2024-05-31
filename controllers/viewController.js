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

exports.getTour = (req, res) => {
  res.status(200).render("tour", {
    title: "The River Run",
  });
};
