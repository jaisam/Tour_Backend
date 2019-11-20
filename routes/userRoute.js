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
    // authController.protect,
    authController.updatePassword);
router.get('/me',
    // authController.protect,
    userController.getMe,
    userController.getUser);
router.patch('/updateMe',
    // authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe);
router.delete('/deleteMe',
    // authController.protect,
    userController.deleteMe);


// Hereafter, all routes are Authorised routes.
// Only admin have rights for below rights. Hence calling authController.restrictTo('admin') before below routes
router.use(authController.restrictTo('admin'));


router.get('/',
    // authController.protect,
    // authController.restrict('admin'),
    userController.getAllUsers);
router.post('/',
    // authController.protect,
    // authController.restrict('admin'),
    userController.createUser);
router.get('/:id',
    // authController.protect,
    userController.getUser);
router.patch('/:id',
    // authController.protect,
    // authController.restrict('admin'),
    userController.updateUser);
router.delete('/:id',
    // authController.protect,
    // authController.restrict('admin'),
    userController.deleteUser);


module.exports = router;