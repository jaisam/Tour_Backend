const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');


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

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Because when we create user we donot want to sent password in response, but it is sent in response, in find it is not returning because of select:false in usermodel
    user.password = undefined;
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    return res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body);
    const { name, email, password, passwordConfirm } = req.body;
    if (!name || !email || !password || !passwordConfirm) {
        return next(new AppError("Please provide mandatory fields!", 400));
    }

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const savedData = await newUser.save();
    const url = `${req.protocol}://${req.get('Host')}/api/user/me`;
    await new Email(newUser, url).welcomeMail();
    createSendToken(newUser, 201, res);
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exists
    if (!email || !password) {
        /* Using my own AppError class which extends inbuilt Error Class */
        return next(new AppError('Please provide Email and Password', 400));
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        /* Using my own AppError class which extends inbuilt Error Class */
        return next(new AppError('Incorrect Email or Password', 401));
    }

    createSendToken(user, 200, res);
});


exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Check If token is there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2) Verification of token
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to access!', 401));
    }

    // 3) Check if user exists for this token, if not that means user's account is deleted so dont grant access
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('User with this token does not exist', 401));
    }

    // 4) Check if user changed password after token was issued, if true throw error.
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password.Please login again', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    next();
});


exports.restrictTo = (...roles) => {
    return function (req, res, next) {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            return next(new AppError(' You do not have permission to perform this action', 403));
        }
    }
};


exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on Posted Email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email address', 404));
    }
    // 2) Generate random Reset Token
    const resetToken = user.createPasswordResetToken();
    const savedUser = await user.save({ validateBeforeSave: false }); //THis is done because in schema we have required fields but we are not saving whole data
    console.log('savedUserUser', savedUser);

    // 3) Send it to user via email

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/user/resetPassword/${resetToken}`;
        await new Email(user, resetURL).forgotPasswordMail();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        console.log(error);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending email. Try again later!', 500));
    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get User based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    // console.log('hashedToken : ', hashedToken);
    // console.log('Current Date', new Date().toISOString());

    // 2) If token has expired, and there is user, ask him to use forgot password again
    const user = await User.findOne(
        {
            passwordResetToken: hashedToken
            , passwordResetExpires: {
                $gt: new Date().toISOString()
            }
        });
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    const newUser = await user.save();
    // console.log('New User :', newUser);

    // 3) Update changedPasswordAt property for user
    // This is done in userModel

    // // 4) Send password reset mail
    // const email = new Email(newUser).resetPasswordMail();

    // 5) Log the user in, send the JWT again
    createSendToken(user, 201, res);
});


exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) We need to get user
    if (!req.body.passwordCurrent || !req.body.password || !req.body.passwordConfirm) {
        return next(new AppError('All fields are mandatory', 400));
    }
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if posted password is correct
    if (!await user.correctPassword(req.body.passwordCurrent, user.password))
        return next(new AppError('Your current password is wrong', 401));

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // findByIdandUpdate not used because validate will not work and save hooks defined in model as well.

    // 4) Log user in, send JWT token
    createSendToken(user, 200, res);
});