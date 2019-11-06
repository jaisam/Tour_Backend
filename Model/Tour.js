const mongoose = require('mongoose');

const TourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        trim: true,
        unique: true,
        // Checks length is between minlength and maxlength.
        maxlength: [100, 'A tour can have name between 1-100 characters'],
        minlength: [1, 'A tour can have name between 1-100 characters']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have Group Size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty level'],
        // checks if value entered is in predefined set or not.
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'A tour must have difficulty level of either : easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        // Checks value is in range of min and max.
        min: [1, 'A tour can have rating Average between 1 and 5'],
        max: [5, 'A tour can have rating Average between 1 and 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have price']
    },
    priceDiscount: {
        type: Number,
        // Custom validator. This function does not works on update function()
        validate: {  
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discounted Price ({VALUE}) should be less than or equal to Original Price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have Cover Image']
    },
    images: [String],
    createdAt : {
        type : Date,
        default : Date.now()
    },
    startDates: [Date],
    // slug: String
});

module.exports = mongoose.model('Tour', TourSchema);