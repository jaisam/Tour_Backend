const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();


const app = express();

mongoose.connect(process.env.DATABASE_LOCAL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => console.log('Connected to database!')
);

const db = mongoose.connection;
db.on('error', (error) => console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('connnection succesful'));


app.listen(process.env.PORT, () =>
    console.log(`App running on ${process.env.PORT}`)
);

if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}
//Middlewares
app.use(express.json());

// Importing Middleware
const tourRoute = require('./routes/tourRoute');

app.use('/tours', tourRoute);

app.all('*', (req, res, next) => {
    const error = new Error(`Requested ${req.originalUrl} route not found!`);
    error.status = 'fail';
    error.statusCode = 404;
    next(error);
});

app.use((error, req, res, next) => {
    console.log(`Error occured in ${error.errorAt} API function`);
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    error.message = error.message || 'Internal Server Error';

    if (process.env.NODE_ENV === 'development') {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            errorStack: error.stack
        });
    } else if (process.env.NODE_ENV === 'production') {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }
})