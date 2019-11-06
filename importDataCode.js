const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const Tour = require('./Model/Tour');


mongoose.connect(process.env.DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => {
        console.log('Conected to database!');
    }
);

const db = mongoose.connection;
db.on('error', (error) => console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('connnection succesful'));


const tours = JSON.parse(fs.readFileSync('./tourData.js', 'utf-8'));

async function insertData() {
    // console.log(tours);
    try {
        // data.forEach(data => {
        //     let savedData = new Tour(data);
        //     await savedData.save();
        //     console.log(savedData);
        // })
        console.log(process.env.DB_URL);
        console.log('Inside insertData');
        await Tour.create(tours);
        console.log('Data inserted!');
    } catch (error) {
        console.log(error);
    }
}

async function deleteData() {
    try {
        console.log('Inside deleteData');
        await Tour.deleteMany();
        console.log('Data deleted');
    } catch (error) {
        console.log(error);
    }
}

deleteData();
insertData();