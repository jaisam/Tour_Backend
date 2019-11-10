const express = require('express');
const tourController = require('../Controllers/tourController');


const router = express.Router();


router.get('/', tourController.getAllTour );
router.get('/:tourId', tourController.getTour );
router.post('/', tourController.addTour );
router.patch('/:tourId', tourController.updateTour );
router.delete('/:tourId', tourController.deleteTour );


module.exports = router;