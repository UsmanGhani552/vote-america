const express = require('express');
const userRoutes = express();
const bodyParser = require('body-parser');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Middleware to parse JSON bodies
// userRoutes.use(bodyParser.json());
// userRoutes.use(bodyParser.urlencoded({ extended: true }));

//auth 
userRoutes.post('/register',authController.register);
userRoutes.post('/login',authController.login);
userRoutes.post('/verify-otp',authController.verifyOtp);
userRoutes.post('/forgot-password',authController.forgotPassword);
userRoutes.post('/reset-password',authController.resetPassword);

//user
userRoutes.post('/personal-detail',verifyToken,userController.personalDetail);
userRoutes.post('/change-password',verifyToken,userController.changePassword);

//candidate
userRoutes.get('/get-candidate-by-id/:id',userController.getCandidateById);

module.exports = userRoutes;