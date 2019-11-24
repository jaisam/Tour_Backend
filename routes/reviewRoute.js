const express = require('express');
const reviewController = require('../Controllers/reviewController');
const authController = require('../Controllers/authController');


const router = express.Router({ mergeParams: true });

/* This reviewRoute will be called through 2 URL's. 
/tour/tourId/reviews
/reviews
*/

// Public Routes
router.get('/', reviewController.getAllReview);
router.get('/:id', reviewController.getReview);


// Below routes are authenticated. Hence calling authController.protect midlleware before.
router.use(authController.protect);

router.post('/',
    authController.restrictTo('user'),
    reviewController.assignTourUserIds,
    reviewController.createReview);

router.patch('/:id',
    authController.restrictTo('user','admin'),
    reviewController.updateReview);

router.delete('/:id',
    authController.restrictTo('user','admin'),
    reviewController.deleteReview);

module.exports = router;