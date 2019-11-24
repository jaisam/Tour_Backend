

const catchAsync = function (fn) {
    return function (req, res, next) {
        // fn(req, res, next).catch(err => next(new AppError(err.message , 500)));
        fn(req, res, next).catch(next);
    }
};

module.exports = catchAsync