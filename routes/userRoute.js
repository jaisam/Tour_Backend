const express = require('express');
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');


const router = express.Router();

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


// Hereafter, all routes are Autheticated Routes i.e only logged in Users can access these routes.
// Hence calling authController.protect middleware before below routes
router.use(authController.protect);


router.patch('/updateMyPassword',
    authController.updatePassword);

router.get('/me',
    userController.getMe,
    userController.getUser);

router.patch('/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.uploadImagetoS3Bucket,
    userController.updateMe);

router.delete('/deleteMe',
    userController.deleteMe);


// Hereafter, all routes are Authorised routes.
// Only admin have rights for below rights. Hence calling authController.restrictTo('admin') before below routes
router.use(authController.restrictTo('admin'));


router.get('/',
    userController.getAllUsers);

router.post('/',
    userController.createUser);

router.get('/:id',
    userController.getUser);

router.patch('/:id',
    userController.updateUser);

router.delete('/:id',
    userController.deleteUser);


module.exports = router;