const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


// Importing Middleware
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const tourRoute = require('./routes/tourRoute');
const userRoute = require('./routes/userRoute');
const reviewRoute = require('./routes/reviewRoute');


// Init App
const app = express();


// Database Connection
let DB_URL = process.env.NODE_ENV === 'development' ? process.env.DATABASE_LOCAL : process.env.DB_URL;
console.log(DB_URL);
mongoose.connect( DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Connected to database!');
            app.listen(process.env.PORT, () =>
                console.log(`App running on ${process.env.PORT}`)
            );
        }
    }
);



// Middlewares

// Set security HTTP Headers
app.use(helmet());

// Only 500 requests can be send from particular IP in frame of 1 hr
const limiter = rateLimit({
    max : 500,
    windowMs : 60 * 60 * 1000,
    message : 'Too many requests from this IP, please try again after 1 hour!'
});
app.use('/api', limiter);

// Use 'dev' mode of Morgan in development and 'combined' mode of Morgan in Production 
let morganMode = process.env.NODE_ENV == 'development' ? 'dev' : 'combined';
app.use(morgan(morganMode));

// Body Praser, reading data from body into req.body. 
app.use(express.json({ limit : '10kb' }));

// Data Sanitization against NoSQL query injection. If NoSQL query is present in req.body,req.params, it throws error
app.use(mongoSanitize());

// Data Sanitization against XSS.[Check HTML code is present in req.body,req.params]
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({
    whitelist : [
        'duration',
        'maxGroupSize',
        'difficulty',
        'ratingsAverage',
        'ratingsQuantity',
        'price'
    ]
}));


// Route-handler
app.use('/api/tours', tourRoute);
app.use('/api/user', userRoute);
app.use('/api/reviews' , reviewRoute);
app.all('*', (req, res, next) => {
    next(new AppError(`Requested ${req.originalUrl} route not found!`, 404));
});
app.use(globalErrorHandler);