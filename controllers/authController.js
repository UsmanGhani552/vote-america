const User = require("../models/userModel");
const TempUser = require("../models/tempUserModel");
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const validation = require('../utils/validation/auth_validation');
const { generateOtp } = require("../utils/helper/generate_otp");
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendOtp = async (email, otp) => {
    let transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    });

    let mailOptions = {
        from: 'vote-america@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
}

const register = async (req, res) => {
    try {
        const schema = validation.register(req.body);
        if (schema.errored) {
            return res.status(400).json({
                'errors': schema.errors
            });
        }
        const { first_name, last_name, email, phone, password, confirm_password, type } = req.body;

        // Check if password and confirmPassword match
        if (password !== confirm_password) {
            return res.status(400).json({
                status_code: 400,
                message: 'Passwords do not match.',
            });
        }

        const userExist = await User.findOne({
            email
        });

        if (userExist) {
            return res.status(400).json({
                status_code: 400,
                message: 'Email already taken.',
            });

        }

        const otp = generateOtp();
        await sendOtp(email, otp);

        const hashedPassword = await bcryptjs.hash(password, 10);
        // Check if TempUser already exists
        const tempUserExist = await TempUser.findOne({ email });

        if (tempUserExist) {
            // Update existing TempUser's OTP and expiration time
            tempUserExist.otp = otp;
            tempUserExist.otp_expires_at = Date.now() + 300000; // OTP expires in 5 minutes
            await tempUserExist.save();
        } else {
            // Create and save the new TempUser
            const tempUser = new TempUser({
                first_name,
                last_name,
                email,
                phone,
                password: hashedPassword,
                type,
                otp,
                otp_expires_at: Date.now() + 300000 // OTP expires in 5 minutes
            });

            await tempUser.save();
        }

        return res.status(200).json({
            status_code: 200,
            message: 'OTP sent successfully.',
        });

    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const schema = validation.verifyOtp(req.body);
        if (schema.errored) {
            return res.status(400).json({
                'errors': schema.errors
            });
        }

        const { otp, email } = req.body;
        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid or expired OTP'
            });
        }
        if (tempUser.otp !== otp) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid OTP'
            });

        }
        if (Date.now() > tempUser.otp_expires_at) {
            await TempUser.deleteOne({ email });
            return res.status(400).json({
                status_code: 400,
                message: 'OTP expired.'
            });
        }
        const userData = {
            first_name: tempUser.first_name,
            last_name: tempUser.last_name,
            email: tempUser.email,
            phone: tempUser.phone,
            password: tempUser.password,
            type: tempUser.type,
            personal_details_status: 'Pending',
            government_photo_id_status: 'Pending',
        };
        // Add document status only if the type is 'candidate'
        if (tempUser.type === 'candidate') {
            userData.document_status = 'Pending';
        }
        // Create the User object with the conditional properties
        const user = new User(userData);
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        await TempUser.deleteOne({ email });

        const message = {
            title: 'Verification in Progress:',
            body: "Welcome to Vote America! We're verifying your information for voting. You will be able to log in once approved.",
        }
    
        try {
            // const userId = '6658a2e819086f196cd7c8a6';
            await sendNotification(user._id , message);
            res.status(200).send('Notification sent successfully.');
        } catch (error) {
            res.status(500).send(error);
        }
        return res.status(200).json({
            status_code: 200,
            message: 'User registered successfully.',
            user,
            token,
        });
        
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        const schema = validation.login(req.body);
        if (schema.errored) {
            return res.status(400).json({
                'errors': schema.errors
            });
        }
        // res.send({asda:'asda'});
        const { email, password, fcm_token } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status_code: 400,
                message: 'Authentication failed. User not found.',
            });
        }
        
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status_code: 400,
                message: 'Authentication failed. Invalid email or password.',
            });
        }
        user.fcm_token = fcm_token;
        await user.save();

        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
        return res.status(200).json({
            status_code: 200,
            message: 'Authentication successful',
            user: user,
            token: token
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const schema = validation.forgotPassword(req.body);
        if (schema.errored) {
            return res.status(400).json({
                status_code: 400,
                errors: schema.errors
            });
        }
        const { email } = req.body;

        const token = generateOtp();

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({
                status_code: 400,
                message: 'User Not Found'
            });
        }
        
        user.reset_token = token;
        await user.save();
        await sendOtp(email, token);

        // await client.messages.create({
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     body: `Your Reset Token is ${token}`,
        //     to: phone
        // });

        return res.status(200).json({
            status_code: 200,
            message: 'Reset Token sent successfully.',
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }

}

const resetPassword = async (req, res) => {
    try {
        const schema = validation.resetPassword(req.body);
        if (schema.errored) {
            return res.status(400).json({
                status_code: 400,
                errors: schema.errors
            });
        }

        const { token, password } = req.body;
        const user = await User.findOne({ reset_token:token });
        if (!user) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid or expired Token'
            });
        }

        user.password = await bcryptjs.hash(password, 10);
        user.reset_token = null;
        await user.save();

        return res.status(200).json({
            status_code: 200,
            message: 'Password Changed Successfully'
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate the email
        const schema = validation.resendOtp({ email });
        if (schema.errored) {
            return res.status(400).json({
                'errors': schema.errors
            });
        }

        // Check if the email exists in the TempUser collection
        const tempUserExist = await TempUser.findOne({ email });

        if (!tempUserExist) {
            return res.status(400).json({
                status_code: 400,
                message: 'Email not found. Please register first.',
            });
        }

        // Generate a new OTP
        const newOtp = generateOtp();
        await sendOtp(email, newOtp);

        // Update the OTP and expiration time in the TempUser document
        tempUserExist.otp = newOtp;
        tempUserExist.otp_expires_at = Date.now() + 300000; // OTP expires in 5 minutes
        await tempUserExist.save();

        return res.status(200).json({
            status_code: 200,
            message: 'OTP resent successfully.',
        });

    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

module.exports = {
    register,
    login,
    verifyOtp,
    forgotPassword,
    resetPassword,
    resendOtp
}