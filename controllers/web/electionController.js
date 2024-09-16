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
        const elections = await Election.find({});
        // const baseUrl = `${req.protocol}://${req.get('host')}/public/election_images/`;
        return res.status(200).json({
            status_code: 200,
            elections,
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
        upload('elections').fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: err,
                    message: 'Error uploading file(s) to S3',
                });
            }
            try {
                const schema = validation.election(req.body);
                if (schema.errored) {
                    return res.status(400).json({
                        status_code: 400,
                        errors: schema.errors
                    });
                }

                const { name } = req.body;

                const image = req.files && req.files.image ? req.files.image[0].location : null;
                const icon = req.files && req.files.icon ? req.files.icon[0].location : null;

                const election = new Election({
                    name,
                    image,
                    icon,

                });
                await election.save();
                res.status(200).send({
                    status_code: 200,
                    'message': 'Election stored successfully.',
                    election,
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
        upload('elections').fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: err,
                    message: 'Error uploading file(s) to S3',
                });
            }
            try {
                const schema = validation.election(req.body);
                if (schema.errored) {
                    return res.status(400).json({
                        status_code: 400,
                        errors: schema.errors
                    });
                }

                const { id } = req.params;
                const { name } = req.body;

                // Find election by ID
                const election = await Election.findById(id);
                if (!election) {
                    return res.status(404).json({
                        status_code: 404,
                        message: 'Election not found',
                    });
                }

                // Update the fields
                election.name = name || election.name;
                election.image = req.files && req.files.image ? req.files.image[0].location : election.image;
                election.icon = req.files && req.files.icon ? req.files.icon[0].location : election.icon;

                await election.save();

                res.status(200).send({
                    status_code: 200,
                    'message': 'Election updated successfully.',
                    election,
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

        const election = await Election.findById(id);
        if (!election) {
            return res.status(404).json({
                status_code: 404,
                message: 'Election not found',
            });
        }

        await election.deleteOne();

        return res.status(200).json({
            status_code: 200,
            message: 'Election deleted successfully.',
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