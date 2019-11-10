const AppError = require('../utils/appError');


const sendDevError = (error, req, res, next) => {
    console.log('Inside sendDevError' , error);
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        errorStack: error.stack
    });
};


const sendProdError = (err, req, res, next) => {
  // Operational, trusted error: send message to client
  console.log('Inside sendProdError' , err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR <===========>', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};


const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400);
};


const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};


const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};


const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', 401);
};


const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', 401);
};


module.exports = (error, req, res, next) => {

    console.log('Inside Global Error Handler' , error);

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(error, req, res, next);

    } else if (process.env.NODE_ENV === 'production') {
        let err = { ...error };
        console.log('Inside Global Error Handler, else part' , err);
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') err = handleJWTError();
        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
        
        console.log('Inside Global Error Handler, inside Production else' , err);
        sendProdError(err, req, res, next);
    }
}