const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

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
        createSendToken(newUser, 201, res);

    } catch (error) {
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

    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};


exports.protect = async (req, res, next) => {
    try {
        let token;
        // 1) Check If token is there
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2) Verification of token
        if (!token) {
            return next(new AppError('You are not logged in! Please log in to access!'), 401);
        }

        // 3) Check if user exists for this token, if not that means user's account is deleted so dont grant access
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
            return next(new AppError('User with this token does not exist'), 401);
        }

        // 4) Check if user changed password after token was issued, if true throw error.
        if (freshUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password.Please login again'), 401);
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = freshUser;
        next();
    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};


exports.restrictTo = (...roles) => {
    return function (req, res, next) {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            return next(new AppError(' You do not have permission to perform this action', 403));
        }
    }
};


exports.forgotPassword = async (req, res, next) => {
    // 1) Get user based on Posted Email
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(new AppError('There is no user with this email address', 404));
        }
        // 2) Generate random Reset Token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false }); //THis is done because in schema we have required fileds but we are not saving whole data

        // 3) Send it to user via email
        const resetURL = `${req.protocol}://${req.get('host')}/api/user/resetPassword/${resetToken}`;

        const message = `Forgot your password? Submit a PATCH request with your new Pasword and PasswordConfirm to 
        : ${resetURL} \n . If you didn't forgot your password, please ignore this email! `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (Valid for 10 mins)',
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email'
            });
        } catch (error) {
            console.log(error);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new AppError('There was an error sending email. Try again later!'), 500);
        }
    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};


exports.resetPassword = async (req, res, next) => {
    try {
        // 1) Get User based on token
        const hashedToken = crypto.createHash('sha256').update(request.params.token).digest('hex');

        // 2) If token has expired, and there is user, ask him to use forgot password again
        const user = await User.findOne(
            {
                passwordResetToken: hashedToken
            },
            {
                passwordResetExpires: {
                    $gt: Date.now()
                }
            });
        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        // 3) Update chnagedPasswordAt property for user
        // This is done in userModel

        // 4) Log the user in, send the JWT again
        createSendToken(newUser, 201, res);

    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};


exports.updatePassword = async (req, res, next) => {
    try {
        // 1) We need to get user
        const user = await User.findById(req.user.id).select('+password');

        // 2) Check if posted password is correct
        if (!await user.correctPassword(req.body.passwordCurrent, user.password))
            return next(new AppError('Your current password is wrong'), 401);

        // 3) If so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();
        // findByIdandUpdate not used because validat will not work and save hooks defined in model as well.

        // 4) Log user in, send JWT token
        createSendToken(user, 200, res);

    } catch (error) {
        /* Using my own AppError class which extends inbuilt Error Class */
        next(new AppError(error.message, 500));
    }
};