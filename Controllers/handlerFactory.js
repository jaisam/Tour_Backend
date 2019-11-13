const AppError = require('../utils/appError');


const calcAverageRatingOfTour = async (req, res, next) => {
    try {
        const reviews = Review.find({ tour: req.body.tour });
        const ratingsAverage = reviews.reduce((a, b) => a + b, 0) / reviews.length || 4.5;
        const ratingsQuantity = reviews.length || 0;
        await Tour.findByIdAndUpdate(req.body.tour, {
            ratingsAverage,
            ratingsQuantity
        });
    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};

exports.getOne = function (Model) {
    return async (req, res, next) => {
        try {
            const doc = await Model.findById(req.params.id)
            // Since we have made this code generalize, populate is used in respective models
            if (!doc) {
                // console.log('Inside NO tour find');
                /* Using my own AppError class which extends inbuilt Error Class */
                next(new AppError('No document found', 404));
            }
            else {
                res.json({
                    status: "success",
                    data: {
                        data: doc
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
}


exports.createOne = function (Model) {
    return async (req, res, next) => {
        try {
            console.log(typeof Model);
            if( Model === 'Review'){
                console.log('True');
            }
            // const newTour = new Tour(req.body);
            // const savedData = await newTour.save();
            const doc = await Model.create(req.body);
            res.status(201).json({
                status: 'success',
                data: {
                    data: doc
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
}



exports.updateOne = function (Model) {
    return async (req, res, next) => {
        try {
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true, // Due to this flag updated document is returned instead of original document.
                runValidators: true // DUe to this flag validation will take place while updating document
            });
            if (!doc) {
                /* Using my own AppError class which extends inbuilt Error Class */
                next(new AppError(`Cannot update document as it does not exist`, 404));
            }
            else {
                res.json({
                    status: "success",
                    data: {
                        data: doc
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
}



exports.deleteOne = function (Model) {
    return async (req, res, next) => {
        try {
            const doc = await Model.findByIdAndDelete(req.params.id);
            if (!doc) {
                /* Using my own AppError class which extends inbuilt Error Class */
                next(new AppError(`Cannot delete document,as it does not exist`, 404));
            } else {
                res.status(204).json({
                    status: "success",
                    data: null
                });
            }
        } catch (error) {
            /* Using my own AppError class which extends inbuilt Error Class */
            next(new AppError(error.message, 500));
        }

    }
}