const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');


exports.assignTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user;
    next();
};


const calcAverageRatingOfTour = async (tour) => {
    const reviews = await Review.find({ tour: tour._id });
    let ratingsAverage = reviews.reduce((sum, obj) => sum + obj.rating, 0) / reviews.length;
    ratingsAverage = ratingsAverage || 4.5; // If no reviews found, update average to default value of 4.5
    let ratingsQuantity = reviews.length || 0; // If no reviews found, update quantity to default value of 0
    tour.ratingsAverage = ratingsAverage;
    tour.ratingsQuantity = ratingsQuantity;
    await tour.save()
};

exports.getAllReview = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);
    // console.log(reviews);
    res.json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    });

});


exports.getReview = Factory.getOne(Review);


// exports.createReview = Factory.createOne(Review);
exports.createReview = catchAsync(async (req, res, next) => {
    // // Checking if req is to add review from tourController.js or for standalone reviewController.js
    // if(!req.body.tour) req.body.tour = req.params.tourId;
    // if(!req.body.user) req.body.user = req.user;

    // const review = await Review.create(req.body);
    let tour = await Tour.findOne({ _id: req.body.tour, isDeleted: false });
    if (!tour) {
        next(new AppError("Tour does not exists", 404));
    }
    const review = new Review(req.body);
    await review.save();
    await calcAverageRatingOfTour(tour);

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    });
});

// exports.updateReview = Factory.updateOne(Review);
exports.updateReview = catchAsync(async (req, res, next) => {
    // Make sure id of tour is send in req.body.tour
    let tour = await Tour.findOne({ _id: req.body.tour, isDeleted: false });
    if (!tour) {
        return next(new AppError("Tour does not exists", 404));
    }
    const doc = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Due to this flag updated document is returned instead of original document.
        runValidators: true // DUe to this flag validation will take place while updating document
    });


    if (!doc) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(`Cannot update document as it does not exist`, 404));
    }
    await calcAverageRatingOfTour(tour);

    res.json({
        status: "success",
        data: {
            data: doc
        }
    });

});


// exports.deleteReview = Factory.deleteOne(Review);
exports.deleteReview = catchAsync(async (req, res, next) => {
    // Make sure id of tour is send in req.body.tour
    let tour = await Tour.findOne({ _id: req.body.tour, isDeleted: false });
    if (!tour) {
        return next(new AppError("Tour does not exists", 404));
    }
    const doc = await Review.findByIdAndDelete(req.params.id);

    if (!doc) {
        /* Using my own AppError class which extends inbuilt Error Class */
        return next(new AppError(`Cannot delete document,as it does not exist`, 404));
    }
    await calcAverageRatingOfTour(tour);
    res.status(204).json({
        status: "success",
        data: null
    });

});
