const validation = require('../utils/validation/auth_validation');
const { getUserFromToken } = require('../utils/helper/auth');
const User = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/personal_details'), function (error, success) {
            if (error) throw error
        });
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name, function (error1, success1) {
            if (error1) throw error1
        });
    }
});
const upload = multer({ storage: storage });


const personalDetail = async (req, res) => {
    try {
        upload.fields([
            { name: 'front_side', maxCount: 1 },
            { name: 'back_side', maxCount: 1 },
            { name: 'additional_documents', maxCount: 5 } // Adjust maxCount based on your requirements
        ])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }

            try {
                const schema = validation.personalDetail(req.body);
                if (schema.errored) {
                    return res.status(400).json({
                        errors: schema.errors
                    });
                }
                const { zip_code, dob, security_number } = req.body;
                
                const front_side = req.files && req.files.front_side ? req.files.front_side[0].filename : null;
                const back_side = req.files && req.files.back_side ? req.files.back_side[0].filename : null;
                const additional_documents = req.files?.additional_documents?.map(file => file.filename) || [];
                
                const user_details = req.user; // Access the user object attached by the verifyToken middleware
                
                // Create an update object based on user type
                let updateFields = { zip_code, dob, security_number, front_side, back_side };
                
                if (user_details.type === 'candidate') {
                    updateFields.additional_documents = additional_documents;
                }
                // return res.send('asd');

                const updateuser = await User.updateOne(
                    { _id: user_details._id },
                    { $set: updateFields },
                    { runValidators: true }
                );

                if (updateuser.nModified === 0) {
                    return res.status(404).json({
                        status_code: 404,
                        message: 'User not found or no changes made'
                    });
                }

                const user = await User.findById(user_details._id);
                return res.status(200).json({
                    status_code: 200,
                    message: 'User Updated successfully.',
                    user,
                });

            } catch (error) {
                return res.status(400).json({
                    status_code: 400,
                    errors: error.message
                });
            }
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }

}


const changePassword = async (req, res) => {
    try {
        const schema = validation.changePassword(req.body);
        if (schema.errored) {
            return res.status(400).json({
                errors: schema.errors
            });
        }

        const { old_password, password } = req.body;

        const token = req.header('Authorization');
        const user_details = getUserFromToken(token);

        const user = await User.findById(user_details.userId);
        if (old_password == user.password) {
            return res.status(400).json({
                status_code: 400,
                message: 'Old Password is incorrect'
            });
        }
        user.password = await bcryptjs.hash(password, 10);
        await user.save();

        return res.status(200).json({
            status_code: 200,
            message: 'Password Changed successfully.',
        });

    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

const getCandidateById = async (req , res) => {
    try {
        const candidate_id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election Id',
            });
        }
        const candidate = await User.findById(candidate_id);    
        if(candidate){
            return res.status(200).json({
                status_code: 200,
                candidate,
            });
        }
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

module.exports = {
    personalDetail,
    changePassword,
    getCandidateById
}