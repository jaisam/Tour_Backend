const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


const calcAverageRatingOfTour = catchAsync(async (req, res, next) => {
    const reviews = Review.find({
        tour: req.body.tour
    });
    const ratingsAverage = reviews.reduce((a, b) =>
        a + b, 0) / reviews.length || 4.5;
    const ratingsQuantity = reviews.length || 0;
    await Tour.findByIdAndUpdate(req.body.tour, {
        ratingsAverage,
        ratingsQuantity
    });
});


exports.getOne = function (Model) {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id)
        // Since we have made this code generalize, populate is used in respective models
        if (!doc) {
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
    });
};


exports.createOne = function (Model) {
    return catchAsync(async (req, res, next) => {
        console.log(typeof Model);
        if (Model === 'Review') {
            console.log('True');
        }
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });
};


exports.updateOne = function (Model) {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Due to this flag updated document is returned instead of original document.
            runValidators: true // DUe to this flag validation will take place while updating document
        });
        if (!doc) {
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
    });
};


exports.deleteOne = function (Model) {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            next(new AppError(`Cannot delete document,as it does not exist`, 404));
        } else {
            res.status(204).json({
                status: "success",
                data: null
            });
        }
    });
};