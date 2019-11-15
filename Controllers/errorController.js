const AppError = require('../utils/appError');
const _=require('lodash');

const sendDevError = (error, req, res, next) => {
    // console.log('Inside sendDevError' , error);
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        errorStack: error.stack
    });
};


const sendProdError = (err, req, res, next) => {
  // Operational, trusted error: send message to client
  // console.log('Inside sendProdError' , err);
  if (err.isOperational) {
    console.log("opp error");
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

    // console.log('Inside Global Error Handler' , error);

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(error, req, res, next);

    } else if (process.env.NODE_ENV === 'production') {
        
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        
        // console.log('Inside Global Error Handler, inside Production else' , err);
        sendProdError(error, req, res, next);
    }
}