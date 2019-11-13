const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactory');
const Tour = require('../models/tourModel');

exports.assignTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user;
    next();
};

exports.getAllReview = async (req, res, next) => {
    try {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const reviews = await Review.find(filter);
        console.log(reviews);
        res.json({
            status: 'success',
            result: reviews.length,
            data: {
                reviews
            }
        });
    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }

};


exports.getReview = Factory.getOne(Review);


exports.createReview = Factory.createOne(Review);
// exports.addReview = async (req, res, next) => {
//     try {
//         // Checking if req is to add review from tourController.js or for standalone reviewController.js
//         if(!req.body.tour) req.body.tour = req.params.tourId;
//         if(!req.body.user) req.body.user = req.user;

//         // let review = new Review(req.body);
//         // review = await review.save();
//         const review = await Review.create(req.body);

//         res.status(201).json({
//             status: 'success',
//             data: {
//                 review
//             }
//         });
//     } catch (error) {
//         /* Using my own AppError class which extends inbuilt Error Class */
//         next(new AppError(error.message, 500));
//     }
// };

exports.updateReview = Factory.updateOne(Review);
exports.deleteReview = Factory.deleteOne(Review);

