const User = require('../../models/userModel');
const mongoose = require('mongoose');
const validation = require('../../utils/validation/auth_validation');
const { sendNotification } = require('../../services/notificationService');

const index = async (req, res) => {
    try {
        const users = await User.find({ type: 'user' });
        return res.status(200).json({
            status_code: 200,
            users,
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message,
        });
    }
}

const show = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await User.findById(id);
        if (candidate.type !== 'user'){
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid User Id',
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
        const schema = validation.changeStatus(req.body);
        if (schema.errored) {
            return res.status(400).json({
                status_code: 400,
                errors: schema.errors
            });
        }
        const { user_id } = req.params;
        const { personal_details_status, government_photo_id_status } = req.body;
        // if (!mongoose.Types.ObjectId.isValid(user_id)) {
        //     return res.status(400).json({
        //         status_code: 400,
        //         message: 'Invalid User Id',
        //     });
        // }
        const user = await User.findById(user_id);
        user.personal_details_status = personal_details_status;
        user.government_photo_id_status = government_photo_id_status;
        await user.save();
        if (user.personal_details_status && user.government_photo_id_status === 'Approved') {
            const message = {
                title: 'Approval Notification:',
                body: "Your information has been verified! You can now log in and access all voting features. Thank you for your patience!",
            }
            await sendNotification(user._id, message);

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

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                status_code: 404,
                message: 'User not found',
            });
        }

        await user.deleteOne();

        return res.status(200).json({
            status_code: 200,
            message: 'User deleted successfully.',
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
    changeStatus,
    show,
    destroy
}