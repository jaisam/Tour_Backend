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
    // Populating Tour name is not required as getllTours fetches review data. IF reviews are fetched alone then we can populate tour name in reviews
    // this.populate({
    //     path : 'tour',
    //     select : 'name'
    // }).populate({
    //     path : 'user',
    //     select : 'name image'
    // });
    this.populate({
        path: 'user',
        select: 'name image'
    });
    next();
});


module.exports = mongoose.model('Review', ReviewSchema);