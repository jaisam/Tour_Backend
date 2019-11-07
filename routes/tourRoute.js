const express = require('express');
const Tour = require('../Model/Tour');
const APIFeatures = require('../utils/apiFeatures');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        // // BUILD QUERY
        let features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // console.log('features => ' , features.query); 
        
        // EXECUTE QUERY   
        const tours = await features.query;
        // console.log('tours', tours);

        if (tours.length < 1) {
            res.status(404).json({
                status: "fail",
                message: "No tours found"
            });
        }
        else {
            res.json({
                status: "success",
                results: tours.length,
                data: {
                    tours
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 'fail',
            message: error
        });
    }
});


router.get('/:tourId', async (req, res, next) => {
    try {
        const tour = await Tour.findById(req.params.tourId);
        if (!tour) {
            res.status(404).json({
                status: "fail",
                message: "No tour found"
            });
        }
        else {
            res.json({
                status: "success",
                data: {
                    tour
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 'fail',
            message: error
        });
    }
});


router.post('/', async (req, res, next) => {
    try {
        const newTour = new Tour(req.body);
        const savedData = await newTour.save();
        // const newTour = await Tour.create(req.body);
        console.log(newTour);
        console.log(savedData);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: 'fail',
            message: error
        });
    }
});


router.patch('/:tourId', async (req, res, next) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, {
            new: true, // Due to this flag updated document is returned instead of original document.
            runValidators: true // DUe to this flag validation will take place
        });
        if (!tour) {
            res.status(404).json({
                status: "fail",
                message: "No tour found"
            });
        }
        else {
            res.json({
                status: "success",
                data: {
                    tour
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 'fail',
            message: error
        });
    }
});



router.delete('/:tourId', async (req, res, next) => {
    try {
        await Tour.findByIdAndDelete(req.params.tourId);
        res.json({
            status: "success",
            data: null
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 'fail',
            message: error
        });
    }
});


module.exports = router;