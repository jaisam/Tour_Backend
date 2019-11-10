const mongoose = require('mongoose');
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
    image: String,
    password: {
        type: String,
        required: ['true', 'A user must have password field'],
        minlength: [8, 'A user must have password of 8 characters'],
        // select - false , it will never select password in find query and will not return to client
        select : false
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
    }
});

UserSchema.pre('save' , async function(next) {
    // Check if password is modified
    if(!this.isModified('password')) return next();

    // Generate hash of password
    this.password = await bcrypt.hash(this.password , 12);

    //clear passwordConfirm field, it is added just to check if password,passwordConfirm are same or not
    //Also,if added in db after hashing, it will generate different hash which is not useful.
    this.passwordConfirm = undefined;
    next();
});

UserSchema.methods.correctPassword = async function (candidate, userPassword) {
    return await bcrypt.compare(candidate,userPassword);
}

module.exports = mongoose.model('User', UserSchema);