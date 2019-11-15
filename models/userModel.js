const mongoose = require('mongoose') // .set('debug', true);
const crypto = require('crypto');
const Validator = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: ['true', 'A user must have name field'],
        trim: true
    },
    email: {
        type: String,
        required: ['true', 'A user must have email field'],
        lowercase: true,
        unique: true,
        validate: {
            validator: Validator.isEmail,
            message: 'Please provide valid Email'
        }
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: ['true', 'A user must have password field'],
        minlength: [8, 'A user must have password of 8 characters'],
        // select - false , it will never select password in find query and will not return to client
        select: false
    },
    passwordConfirm: {
        type: String,
        required: ['true', 'A user must have passwordConfirm field'],
        // validate only works on CREATE/SAVE method
        validate: {
            validator: function (value) {
                return this.password === value;
            },
            message: 'Password and Confim Passoword fields should match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// In 'save' hook, this points to current document. next() keyword is compulsory in pre
UserSchema.pre('save', async function (next) {
    // Check if password is modified
    if (!this.isModified('password')) return next();

    // Generate hash of password
    this.password = await bcrypt.hash(this.password, 12);

    //clear passwordConfirm field, it is added just to check if password,passwordConfirm are same or not
    //Also,if added in db after hashing, it will generate different hash which is not useful.
    this.passwordConfirm = undefined;
    next();
});


UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});


// In 'find' hook, this points to current query, next() keyword is compulsory in pre.
// UserSchema.pre(/^find/, async function (next) {
//     this.find({ active: { $ne: false } });
//     next();
// });


UserSchema.methods.correctPassword = async function (candidate, userPassword) {
    return await bcrypt.compare(candidate, userPassword);
}

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {

    // Password changed after token was assigned
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means Password not changed
    return false;
};


UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
module.exports = mongoose.model('User', UserSchema);