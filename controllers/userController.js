const validation = require('../utils/validation/auth_validation');
const { getUserFromToken } = require('../utils/helper/auth');
const User = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const upload = require('./mediaController');

const personalDetail = async (req, res) => {
    try {
        upload('user_details').fields([
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

                const front_side = req.files && req.files.front_side ? req.files.front_side[0].location : null;
                const back_side = req.files && req.files.back_side ? req.files.back_side[0].location : null;
                const additional_documents = req.files?.additional_documents?.map(file => file.location) || [];

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
                status_code: 400,
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

const getCandidateById = async (req, res) => {
    try {
        const candidate_id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election Id',
            });
        }
        const candidate = await User.findById(candidate_id);
        if (candidate) {
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

const changeStatus = async (req, res) => {
    try {
        const schema = validation.changeStatus(req.body);
        if (schema.errored) {
            return res.status(400).json({
                status_code: 400,
                errors: schema.errors
            });
        }
        const { personal_details_status, government_photo_id_status, document_status } = req.body;

        const token = req.header('Authorization');
        const user_details = getUserFromToken(token);
        const user = await User.findById(user_details.userId);
        user.personal_details_status = personal_details_status;
        user.government_photo_id_status = government_photo_id_status;
        if (user.type == 'candidate') {
            user.document_status = document_status;
        }
        await user.save();

        return res.status(200).json({
            status_code: 200,
            message: 'Status Changed successfully.',
        });

    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

const getStatus = async (req, res) => {
    try {
        // return res.send(req.user);
        // Initialize the status data common to all users
        let status = {
            personal_details_status: req.user.personal_details_status,
            government_photo_id_status: req.user.government_photo_id_status,
        };
        let personal_details = {
            zip_code: req.user.zip_code,
            dob: req.user.dob,
            security_number: req.user.security_number,
        };
        let govt_photo_id = {
            front_side: req.user.front_side,
            back_side: req.user.back_side,
        };
        let additional_documents = {
            additional_documents: req.user.additional_documents,
        };

        let data = {
            status_code: 200,
            status: status,
            data: {
                personal_details: personal_details,
                govt_photo_id: govt_photo_id,
            }
        }

        // Add document_status only if the user is a candidate
        if (req.user.type === 'candidate') {
            status.document_status = req.user.document_status;
            data.data.additional_documents = additional_documents.additional_documents;
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

const editProfile = async (req, res) => {
    try {
        upload('user_details').single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }

            try {
                const schema = validation.editProfile(req.body);
                if (schema.errored) {
                    return res.status(400).json({
                        errors: schema.errors
                    });
                }
                const { first_name, last_name, phone } = req.body;
                const image = req.file.location;

                const token = req.header('Authorization');
                const user_details = getUserFromToken(token);

                const user = await User.findById(user_details.userId);
                user.image = image;
                user.first_name = first_name;
                user.last_name = last_name;
                user.phone = phone;
                await user.save();
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

const deleteAccount = async (req , res) => {
    try{
        const user = req.user;
        await user.deleteOne({});
        return res.status(200).json({
            status_code: 200,
            message: 'User Deleted successfully.',
            user,
        });

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
    getCandidateById,
    changeStatus,
    getStatus,
    editProfile,
    deleteAccount
}