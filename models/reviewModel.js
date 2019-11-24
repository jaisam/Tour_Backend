const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review cannot be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},  // For virtuals
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


ReviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});


module.exports = mongoose.model('Review', ReviewSchema);