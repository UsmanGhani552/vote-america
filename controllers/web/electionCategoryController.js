const User = require('../../models/userModel');
const Election = require('../../models/electionModel');
const ElectionCategory = require('../../models/electionCategoryModel');
const validation = require('../../utils/validation/election_validation');
const path = require('path');
const mongoose = require('mongoose');
const ElectionParty = require('../../models/electionPartyModel');
const upload = require('../mediaController');

const index = async (req, res) => {
    try {
        const electionCategories = await ElectionCategory.find({});
        return res.status(200).json({
            status_code: 200,
            electionCategories,
            // baseUrl
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
        upload('election_category').single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }
            try {
                const schema = validation.electionCategory(req.body);
                if (schema.errored) {
                    return res.status(400).json({
                        status_code: 400,
                        errors: schema.errors
                    });
                }

                const { name, description, election_id } = req.body;

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
                const image = req.file.location;

                const electionCategory = new ElectionCategory({
                    name,
                    image,
                    description,
                    election_id,
                });
                await electionCategory.save();
                res.status(200).send({
                    status_code: 200,
                    'message': 'Election Category stored successfully.',
                    electionCategory,
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
        upload('election_category').single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }
            try {
                const schema = validation.electionCategory(req.body);
                if (schema.errored) {
                    return res.status(400).json({
                        status_code: 400,
                        errors: schema.errors
                    });
                }

                const { id } = req.params;
                const { name, description, election_id } = req.body;

                // Check if election_id is a valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(election_id)) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Invalid Election Id',
                    });
                }

                const electionCategory = await ElectionCategory.findById(id);
                if (!electionCategory) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Election Category not found',
                    })
                }

                const existing_id = await Election.findById(election_id);
                if (!existing_id) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Election not found',
                    })
                }
                
                electionCategory.name = name;
                electionCategory.image = req.file.location ?? electionCategory.image;
                electionCategory.description = description;
                electionCategory.election_id = election_id;
                await electionCategory.save();

                res.status(200).send({
                    status_code: 200,
                    'message': 'Election Category updated successfully.',
                    electionCategory,
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

        const electionCategory = await ElectionCategory.findById(id);
        if (!electionCategory) {
            return res.status(404).json({
                status_code: 404,
                message: 'Election Category not found',
            });
        }

        await electionCategory.deleteOne();

        return res.status(200).json({
            status_code: 200,
            message: 'Election Category deleted successfully.',
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