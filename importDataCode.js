const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const Tour = require('./models/tourModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');
const path = require('path');


mongoose.connect(process.env.DB_URL, // process.env.DATABASE_LOCAL, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    async (err) => {
        if (err) {
            console.log(err);
        }
        console.log(process.env.DB_URL);
        console.log('Conected to database!');
        await deleteData();
        await insertData();
        process.exit();
    }
);



const tours = JSON.parse(fs.readFileSync(path.join(__dirname, 'tours.json'), 'utf-8'));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf-8'));


async function insertData() {
    // console.log(tours);
    try {
        // data.forEach(data => {
        //     let savedData = new Tour(data);
        //     await savedData.save();
        //     console.log(savedData);
        // })
        console.log('Inside insertData');

        await Tour.create(tours);
        await User.create(users);
        await Review.create(reviews);

        console.log('Data inserted!');
    } catch (error) {
        console.log(error);
    }
}

async function deleteData() {
    try {
        console.log('Inside deleteData');
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data deleted');
    } catch (error) {
        console.log(error);
    }
}

