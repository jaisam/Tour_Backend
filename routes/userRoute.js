const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');


router.post('/signup', authController.signup );
router.post('/login', authController.login );


module.exports = router;