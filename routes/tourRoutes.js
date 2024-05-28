const express = require("express");

const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

// How to GET or POST a review based on the TOUR id...

// nested routes...

// GET /tours/1234/reviews
// POST /tours/1234/reviews
// GET /tours/1234/reviews/1234

// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );

// NOTE: this is not an ideal way that the tour router is using the review controller we have separate both, we will use express advance feature of mergeParams in order to get tour params to review route, and using a middleware to tour route to redirect it to review route...

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews

router.use("/:tourId/reviews", reviewRouter);

router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );
// router.param("id", tourController.checkId); // param middleware...

// we can protect routes by using middlewares.
router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );
// .post(tourController.checkNewTour, tourController.createTour);

// chaining the checkNewTour custom middleware to post request, whenever post req is made, instead of running the callback, our middleware will run first (useful for validating data whenever req is made)...
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
