// const User = require('../../models/userModel');
const Election = require('../../models/electionModel');
// const ElectionCategory = require('../../models/electionCategoryModel');
const validation = require('../../utils/validation/election_validation');
const path = require('path');
const mongoose = require('mongoose');
const ElectionParty = require('../../models/electionPartyModel');
const upload = require('../mediaController');

const index = async (req, res) => {
    try {
        const electionParties = await ElectionParty.find({}).populate('candidate_id');
        return res.status(200).json({
            status_code: 200,
            electionParties,
        });

    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message,
        });
    }

}

const store = async (req, res) => {
    try {
        upload('election_party').single('icon')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }
            try {
                const schema = validation.electionParty(req.body);
                if (schema.errored) {
                    return res.status(401).json({
                        errors: schema.errors
                    });
                }
                
                const { name, description, election_id } = req.body;
                // Check if election_id is a valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(election_id)) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Invalid Election Id',
                    });
                }
                
                const existing_id = await Election.findOne({ _id: election_id }).exec();
                if (!existing_id) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Election not found',
                    })
                }
                const icon = req.file.location;
                // res.send('asd');

                const electionParty = new ElectionParty({
                    name,
                    icon,
                    description,
                    election_id,
                });
                await electionParty.save();
                res.status(200).send({
                    status_code: 200,
                    'message': 'Election Party stored successfully.',
                    electionParty,
                });
            } catch (error) {
                return res.status(400).json({
                    status_code: 400,
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
}

const update = async (req, res) => {
    try {
        upload('election_party').single('icon')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }
            try {
                const schema = validation.electionParty(req.body);
                if (schema.errored) {
                    return res.status(401).json({
                        errors: schema.errors
                    });
                }
                const { id } = req.params;
                const { name, description, election_id } = req.body;

                const electionParty = await ElectionParty.findById(id);
                if (!electionParty) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Election Party not found',
                    })
                }

                if (!mongoose.Types.ObjectId.isValid(election_id)) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Invalid Election Id',
                    });
                }
                
                const existing_id = await Election.findOne({ _id: election_id }).exec();
                if (!existing_id) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Election not found',
                    })
                }

                electionParty.name = name,
                electionParty.icon = req.file.location,
                electionParty.description = description,
                electionParty.election_id = election_id,
                await electionParty.save();
                res.status(200).send({
                    status_code: 200,
                    'message': 'Election Party updated successfully.',
                    electionParty,
                });
            } catch (error) {
                return res.status(400).json({
                    status_code: 400,
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
}

const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const electionParty = await ElectionParty.findById(id);
        if (!electionParty) {
            return res.status(404).json({
                status_code: 404,
                message: 'Election Party not found',
            });
        }

        await electionParty.deleteOne();

        return res.status(200).json({
            status_code: 200,
            message: 'Election Party deleted successfully.',
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
    store,
    update,
    destroy
}