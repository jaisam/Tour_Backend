const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AWS = require('aws-sdk');

// This informs that storage option is buffer
const storage = multer.memoryStorage();

// This will check if uploaded file is image or not 
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image'))
        cb(null, true);
    else
        cb(new AppError('Pease upload a image', 400), false);
};

// Stores file into specified storage with specified filename
const upload = multer({
    storage,
    fileFilter
});

// this will store imageCover,images into req.files
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);


exports.resizeTourImages = async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
    // console.log(req.files);

    // 1) imageCover
    req.files.imageCover[0].filename = `tour/tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
    // .toFile(`public/img/tours/${filename}`);
    // req.body.imageCover = filename;
    // console.log(req.files.imageCover[0]);
    const data = await uploadImagetoS3Bucket(req.files.imageCover[0]);
    req.body.imageCover = data.Location;

    // 2) images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            // console.log(file);
            let filename = `tours/tour-${req.params.id}-${Date.now()}-image-${i + 1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1300)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
            // .toFile(`public/img/tours/${filename}`);

            file.filename = filename;
            // console.log(file.filename);
            const data = await uploadImagetoS3Bucket(file);
            // console.log(data.Location);
            file.filename = data.Location;
            req.body.images.push(file.filename);
        })
    );
    // console.log(req.body.images);

    next();
};


const uploadImagetoS3Bucket = (file) => {
    try {
        // const files = req.files;
        let s3Bucket = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });

        var params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.filename,//`users/user-${req.user.id}-${Date.now()}.jpeg`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read"
        };

        return s3Bucket.upload(params).promise()
    } catch (err) {
        console.log(err);
    }
};


exports.getAllTour = catchAsync(async (req, res, next) => {
    // // BUILD QUERY
    let features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // console.log('features => ', features.query);

    // EXECUTE QUERY   
    const tours = await features.query;
    // console.log('tours', tours);

    if (tours.length < 1) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError('No tours found', 404));
    }
    else {
        res.json({
            status: "success",
            results: tours.length,
            data: {
                tours
            }
        });
    }
});

// exports.getTour = Factory.getOne(Tour);
exports.getTour = async (req, res, next) => {
    try {
        console.log(req.params.id);
        // const tour = await Tour.findById(req.params.id);
        const tour = await Tour.findOne({ slug: req.params.id });
        // populate is called in model
        if (!tour) {
            // console.log('Inside NO tour find');
            /* Using my own AppError class which extends inbuilt Error Class */
            next(new AppError('No tour found', 404));
        }
        else {
            res.json({
                status: "success",
                data: {
                    tour
                }
            });
        }
    } catch (error) {
        console.log(error);
        /* Using inbuilt Error class.
        let err = new Error(error.message);
        err = error;
        err.status = 'fail';
        err.statusCode = '500';
        err.errorAt = 'GetTourById';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
}


exports.createTour = Factory.createOne(Tour);
// exports.addTour = async (req, res, next) => {
//     try {
//         // const newTour = new Tour(req.body);
//         // const savedData = await newTour.save();
//         const newTour = await Tour.create(req.body);
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         /* Using inbuilt Error class.
//         let err = new Error(error.message);
//         err = error;
//         err.status = 'fail';
//         err.statusCode = '400';
//         err.errorAt = 'Post';
//         next(err);
//         */
//         /* Using my own AppError class which extends inbuilt Error Class */
//         next(new AppError(error.message, 400));
//     }
// }

// exports.updateTour = Factory.updateOne(Tour);
exports.updateTour = async (req, res, next) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Due to this flag updated document is returned instead of original document.
            runValidators: true // DUe to this flag validation will take place while updating document
        });
        if (!tour) {
            /* Using my own AppError class which extends inbuilt Error Class */
            next(new AppError(`Cannot update Tour as tour with ${req.params.id} does not exist`, 404));
        }
        else {
            res.json({
                status: "success",
                data: {
                    tour
                }
            });
        }
    } catch (error) {
        console.log(error);
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 400));
    }
}

exports.deleteTour = Factory.deleteOne(Tour);
// exports.deleteTour = async (req, res, next) => {
//     try {
//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if (!tour) {
//             /* Using my own AppError class which extends inbuilt Error Class */
//             next(new AppError(`Cannot delete Tour as tour with ${req.params.id} does not exist`, 404));
//         } else {
//             res.json({
//                 status: "success",
//                 data: null
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         /* Using inbuilt Error class.
//         let err = new Error(error.message);
//         err = error;
//         err.status = 'fail';
//         err.statusCode = '500';
//         err.errorAt = 'Delete';
//         next(err);
//         */
//         /* Using my own AppError class which extends inbuilt Error Class */
//         next(new AppError(error.message, 500));
//     }
// }