const mongoose = require('mongoose');
const slugify = require('slugify');

const TourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        trim: true,
        unique: true,
        maxlength: [100, 'A tour can have name between 1-100 characters'],
        minlength: [1, 'A tour can have name between 1-100 characters']
    },
    slug: {
        type : String,
        unique : true
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
        max: [5, 'A tour can have rating Average between 1 and 5'],
        set: val => Math.round(val * 10) / 10 // 4.66666666 -> 46.666666 -> 47 -> 4.7
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
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false //createdAt property will never be sent to user in request
    },
    startDates: [Date],
    isDeleted:{
        type:Boolean,
        default:false
    },
    startLocation: {
        // Nested Object
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        },
        adddress: String,
        description: String,
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: {
                type: [Number]
            },
            address: String,
            Description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},  // For virtuals
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// Indexes :
TourSchema.index({ price: 1, ratingsAverage: -1 });

// Virtuals : 
TourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});


// Virtual populate :
// Review ids are not stored in tours, as reviews canbe many so tour document will have these many ids.
// We will use virtual populate instead to pouplate reviews.
TourSchema.virtual('reviews', {
    ref: 'Review',
    // Defining primary key/ foreign key relationship
    localField: '_id',
    foreignField: 'tour'
});


// DOCUMENT MIDDLEWARE: runs before .save() and .create()
TourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});


// QUERY MIDDLEWARE : this points to current query object returned by Find,update,delete.
// Once find objects returns query, it will run and populate 'guides,'reviews' and then save document in db.
TourSchema.pre(/^find/, function (next) {
    this.populate(
        {
            path: 'guides',
            select: '-__v -passwordChangedAt'
        }
    ).populate(
        {
            path: 'reviews'
        }
    );
    next();
});


module.exports = mongoose.model('Tour', TourSchema);