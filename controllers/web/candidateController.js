const User = require('../../models/userModel');
const mongoose = require('mongoose');
const validation = require('../../utils/validation/auth_validation');
const { sendNotification } = require('../../services/notificationService');
const upload = require('../mediaController');
const bcryptjs = require('bcryptjs');

const index = async (req, res) => {
    try {
        const candidates = await User.find({ type: 'candidate' });
        return res.status(200).json({
            status_code: 200,
            candidates,
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message,
        });
    }
}

const create = async (req, res) => {
    try {
        upload("user_details").fields([
            { name: "image", maxCount: 1 },
            { name: "front_side", maxCount: 1 },
            { name: "back_side", maxCount: 1 },
            { name: "additional_documents", maxCount: 5 }, // Adjust maxCount based on your requirements
        ])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: "Error uploading file.",
                    msg: err
                });
            }

            // return res.send(req.files);
            try {
                const schema = validation.createCandidate(req.body);
                if (schema.errored) {
                    return res.status(400).json({
                        errors: schema.errors,
                    });
                }
                const {
                    first_name,
                    last_name,
                    email,
                    phone,
                    password,
                    confirm_password,
                    zip_code,
                    dob,
                    security_number,
                    bio
                } = req.body;

                if (password !== confirm_password) {
                    return res.status(400).json({
                        status_code: 400,
                        message: "Passwords do not match.",
                    });
                }

                const userExist = await User.findOne({
                    email,
                });

                if (userExist) {
                    return res.status(400).json({
                        status_code: 400,
                        message: "Email already taken.",
                    });
                }

                const hashedPassword = await bcryptjs.hash(password, 10);
                const image = req.files && req.files.image
                    ? req.files.image[0].location
                    : null;
                const front_side = req.files && req.files.front_side
                    ? req.files.front_side[0].location
                    : null;
                const back_side =
                    req.files && req.files.back_side
                        ? req.files.back_side[0].location
                        : null;
                const additional_documents =
                    req.files?.additional_documents?.map((file) => file.location) || [];
                const userData = {
                    first_name,
                    last_name,
                    email,
                    phone,
                    password: hashedPassword,
                    type: "candidate",
                    personal_details_status: "Approved",
                    government_photo_id_status: "Approved",
                    document_status: "Approved",
                    zip_code,
                    dob,
                    security_number,
                    front_side,
                    back_side,
                    additional_documents,
                    image,
                    bio
                };
                // Create the User object with the conditional properties
                const candidate = new User(userData);
                await candidate.save();
                return res.status(200).json({
                    status_code: 200,
                    message: 'Candidate Stored Successfully',
                    userData
                });
            } catch (error) {
                return res.status(500).json({
                    status_code: 500,
                    errors: error.message,
                });
            }
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message,
        });
    }
};

const show = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await User.findById(id);
        if (candidate.type !== 'candidate'){
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Candidate Id',
            });
        }
        return res.status(200).json({
            status_code: 200,
            candidate,
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message,
        });
    }
}

const changeStatus = async (req, res) => {
    try {
        const schema = validation.changeStatus(req.body, 'candidate');
        if (schema.errored) {
            return res.status(400).json({
                status_code: 400,
                errors: schema.errors
            });
        }
        const { candidate_id } = req.params;
        const { personal_details_status, government_photo_id_status, document_status } = req.body;
        // if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
        //     return res.status(400).json({
        //         status_code: 400,
        //         message: 'Invalid Candidate Id',
        //     });
        // }
        const candidate = await User.findById(candidate_id);
        candidate.personal_details_status = personal_details_status;
        candidate.government_photo_id_status = government_photo_id_status;
        candidate.document_status = document_status;
        await candidate.save();
        if (candidate.personal_details_status && candidate.government_photo_id_status && candidate.document_status === 'Approved') {
            const message = {
                title: 'Approval Notification:',
                body: "Your information has been verified! You can now log in and access all voting features. Thank you for your patience!",
            }
            await sendNotification(candidate._id, message);
        }

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

const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const candidate = await User.findById(id);
        if (!candidate) {
            return res.status(404).json({
                status_code: 404,
                message: 'Candidate not found',
            });
        }

        await candidate.deleteOne();

        return res.status(200).json({
            status_code: 200,
            message: 'Candidate deleted successfully.',
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message,
        });
    }
}

module.exports = {
    index,
    create,
    changeStatus,
    destroy,
    show
}