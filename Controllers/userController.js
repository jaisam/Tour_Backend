const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('../Controllers/handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


// This will not update pasword, for that purpose updatePassword and reserPassword routes should be used.
exports.updateMe = async (req, res, next) => {
    try {
        // 1) If Password change then throw error
        if (req.body.password || req.body.passwordConfirm) {
            return next(new AppError(`This route is not for Password updates. Please use 
            /updateMyPassword `, 400));
        }
        // 2) Update user document
        const filteredBody = filterObj(req.body, 'name', 'email');
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

    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};

// If user wants to delete this account, its active status will be set to false.
// Only admin can delete accounts.
exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            active: false
        });
        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
}


exports.createUser = async (req, res, next) => {
    try {
        res.status(500).json({
            status : 'error',
            message : 'Please use /signup route to create User'
        });
    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
}



exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.json({
            status: 'success',
            length : users.length,
            data: {
                users
            }
        });

    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
}

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);