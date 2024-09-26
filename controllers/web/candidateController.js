const User = require('../../models/userModel');
const mongoose  = require('mongoose');
const validation = require('../../utils/validation/auth_validation');

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

const changeStatus = async (req, res) => {
    try {
        const schema = validation.changeStatus(req.body,'candidate');
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

module.exports = {
    index,
    changeStatus
}