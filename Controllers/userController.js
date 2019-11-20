const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('../Controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

// Sets the location, filename property of image to be stored in disk
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(new AppError('Cannot set destination of uploaded photo', 500),
//             'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(new AppError('Cannot set name for uploaded photo', 500),
//             `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

// This informs that storage option is buffer
const storage = multer.memoryStorage();

// This will check if uploaded file is image or not 
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image'))
    cb(null, true);
 else 
    cb(new AppError('Please upload a image', 400), false);
};

// Stores file into specified storage with specified filename
const upload = multer(
    {
        storage,
        fileFilter
    });


// 'photo' property holds uploaded file. single() will add that file into req.file 
exports.uploadUserPhoto = upload.single('photo');

// Resize the uploaded image
exports.resizeUserPhoto = async(req,res,next) => {
    if(!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);

    next();
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


// This will not update pasword, for that purpose updatePassword and reserPassword routes should be used.
exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.file);
    // console.log(req.body);
    // 1) If Password change then throw error
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError(`This route is not for Password updates. Please use 
    /updateMyPassword `, 400));
    }
    // 2) Update user document
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// If user wants to delete this account, its active status will be set to false.
// Only admin can delete accounts.
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false
    });
    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.createUser = catchAsync(async (req, res, next) => {
    res.status(500).json({
        status: 'error',
        message: 'Please use /signup route to create User'
    });
});



exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.json({
        status: 'success',
        length: users.length,
        data: {
            users
        }
    });
});

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);