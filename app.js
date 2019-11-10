const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();


// Importing Middleware
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const tourRoute = require('./routes/tourRoute');
const userRoute = require('./routes/userRoute');


// Init App
const app = express();


// Database Connection
// console.log(process.env.DATABASE_LOCAL);
mongoose.connect(process.env.DATABASE_LOCAL,
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
let morganMode = process.env.NODE_ENV == 'development' ? 'dev' : 'combined';
app.use(morgan(morganMode));
app.use(express.json());


// Routes
app.use('/tours', tourRoute);
app.use('/user', userRoute);
app.all('*', (req, res, next) => {
    next(new AppError(`Requested ${req.originalUrl} route not found!`, 404));
});
app.use(globalErrorHandler);