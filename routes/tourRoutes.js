const express = require("express");

const tourController = require("./../controllers/tourController");

const router = express.Router();

// router.param("id", tourController.checkId); // param middleware...

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);
// .post(tourController.checkNewTour, tourController.createTour);

// chaining the checkNewTour custom middleware to post request, whenever post req is made, instead of running the callback, our middleware will run first (useful for validating data whenever req is made)...
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
