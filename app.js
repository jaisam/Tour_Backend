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

if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}
//Middlewares
app.use(express.json());

// Importing Middleware
const tourRoute = require('./routes/tourRoute');

app.use('/tours', tourRoute);
