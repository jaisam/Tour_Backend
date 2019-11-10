const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');


const signToken = id => {
    return jwt.sign(
        {
            id
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};


exports.signup = async (req, res, next) => {
    try {
        // const newUser = await User.create(req.body);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        });
        const savedData = await newUser.save();
        const token = signToken(newUser._id);
        // console.log('newUser is :', newUser);
        // console.log('savedData is :', savedData);
        // console.log('token is :', token);
        return res.status(200).json({
            status: 'success',
            token
            // ,
            // data: {
            //     user: newUser
            // }
        });
    } catch (error) {
        /* Using inbuilt Error class.
        let err = new Error(error.message);
        err = error;
        err.status = 'fail';
        err.statusCode = '500';
        err.errorAt = 'Signup API of User';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exists
        if (!email || !password) {
            var err;
            /* Using inbuilt Error class.
            err = new Error('Please provide Email and Password');
            err.status = 'fail';
            err.statusCode = '400';
            err.errorAt = 'Login API of User';
            throw err;
            */
            /* Using my own AppError class which extends inbuilt Error Class */
            return next(new AppError('Please provide Email and Password', 400));
        }

        // Check if user exists and password is correct
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password, user.password))) {
            /* Using inbuilt Error class.
            err = new Error('Incorrect Email or Password');
            err.status = 'fail';
            err.statusCode = '401';
            err.errorAt = 'Login API of User';
            throw err;
            */
            /* Using my own AppError class which extends inbuilt Error Class */
            return next(new AppError('Incorrect Email or Password', 401));
        }
        const token = signToken(user._id);

        // if everything ok, send token to client
        res.json({
            status: 'success',
            token
        });
    } catch (error) {
        /* Using inbuilt Error class.
        err = new Error( err.message|| error.message);
        err = error;
        err.status = err.status || 'fail';
        err.statusCode = err.statusCode || '500';
        err.errorAt = err.errorAt || 'Login API of User';
        next(err);
        */
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};