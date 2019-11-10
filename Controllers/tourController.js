const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAllTour = async (req, res, next) => {
    try {
        // // BUILD QUERY
        let features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        console.log('features => ', features.query);

        // EXECUTE QUERY   
        const tours = await features.query;
        // console.log('tours', tours);

        if (tours.length < 1) {
            /* Using my own AppError class which extends inbuilt Error Class */
            next(new AppError('No tours found', 404));
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
        /* Using inbuilt Error class.
        let err = new Error(error.message);
        err = error;
        err.status = 'fail';
        err.statusCode = '500';
        err.errorAt = 'GetAllTours';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
}


exports.getTour = async (req, res, next) => {
    try {
        const tour = await Tour.findById(req.params.tourId);
        console.log(tour);
        if (!tour) {
            // console.log('Inside NO tour find');
            /* Using my own AppError class which extends inbuilt Error Class */
            next(new AppError('No tour found', 404));
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
        /* Using inbuilt Error class.
        let err = new Error(error.message);
        err = error;
        err.status = 'fail';
        err.statusCode = '500';
        err.errorAt = 'GetTourById';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
}


exports.addTour = async (req, res, next) => {
    try {
        const newTour = new Tour(req.body);
        const savedData = await newTour.save();
        // const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (error) {
        console.log(error);
        /* Using inbuilt Error class.
        let err = new Error(error.message);
        err = error;
        err.status = 'fail';
        err.statusCode = '400';
        err.errorAt = 'Post';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 400));
    }
}


exports.updateTour = async (req, res, next) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, {
            new: true, // Due to this flag updated document is returned instead of original document.
            runValidators: true // DUe to this flag validation will take place while updating document
        });
        if (!tour) {
            /* Using my own AppError class which extends inbuilt Error Class */
            next(new AppError(`Cannot update Tour as tour with ${req.params.tourId} does not exist`, 404));
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
        /* Using inbuilt Error class.
        let err = new Error(error.message);
        err = error;
        err.status = 'fail';
        err.statusCode = '400';
        err.errorAt = 'Patch';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 400));
    }
}

exports.deleteTour = async (req, res, next) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.tourId);
        if (!tour) {
            /* Using my own AppError class which extends inbuilt Error Class */
            next(new AppError(`Cannot delete Tour as tour with ${req.params.tourId} does not exist`, 404));
        } else {
            res.json({
                status: "success",
                data: null
            });
        }
    } catch (error) {
        console.log(error);
        /* Using inbuilt Error class.
        let err = new Error(error.message);
        err = error;
        err.status = 'fail';
        err.statusCode = '500';
        err.errorAt = 'Delete';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
}