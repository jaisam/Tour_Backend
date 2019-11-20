const express = require('express');
const tourController = require('../Controllers/tourController');
const authController = require('../Controllers/authController');
const reviewRouter = require('../routes/reviewRoute');


const router = express.Router();

// Public Routes
router.get('/', tourController.getAllTour);
router.get('/:id', tourController.getTour);


// Review will be added to particular tour, so we will need ID of tour. Hence we came to tourRouter first.
// Now we got tourId , we will go to reviewRouter and use its API's.
// Make sure to add mergeParams : true in reviewRouter  
router.use('/:tourId/reviews', reviewRouter);


// Below routes are Authenticated Routes and Authorised Routes.
//Hence calling authController.protect middleware before routes
router.use(authController.protect, authController.restrictTo('admin', 'lead-guide'));


router.post('/',
    // authController.protect,
    tourController.createTour);
router.patch('/:id',
    // authController.protect,
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour);
router.delete('/:id',
    // authController.protect,
    tourController.deleteTour);


module.exports = router;