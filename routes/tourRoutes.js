const express = require("express");

const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");

const router = express.Router();

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);
// router.param("id", tourController.checkId); // param middleware...

// we can protect routes by using middlewares.
router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
// .post(tourController.checkNewTour, tourController.createTour);

// chaining the checkNewTour custom middleware to post request, whenever post req is made, instead of running the callback, our middleware will run first (useful for validating data whenever req is made)...
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

// How to GET or POST a review based on the TOUR id...

// nested routes...

// GET /tours/1234/reviews
// POST /tours/1234/reviews
// GET /tours/1234/reviews/1234

router
  .route("/:tourId/reviews")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  );

module.exports = router;
