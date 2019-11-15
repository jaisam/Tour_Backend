// const AppError = require('../utils/appError');


const catchAsync = function (fn) {
    return function (req, res, next) {
        // fn(req, res, next).catch(err => next(new AppError(err.message , 500)));
        fn(req, res, next).catch(next);
    }
};

module.exports = catchAsync;

// //
// module.exports = fn => {
//     return (req, res, next) => {
//       fn(req, res, next).catch(next);
//     };
//   };