const User = require('../models/userModel');
const Election = require('../models/electionModel');
const ElectionCategory = require('../models/electionCategoryModel');
const validation = require('../utils/validation/election_validation');
const path = require('path');
const mongoose = require('mongoose');
const ElectionParty = require('../models/electionPartyModel');
const upload = require('./mediaController');

const storeElection = async (req, res) => {
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

const getElections = async (req, res) => {
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

const storeElectionCategory = async (req, res) => {
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

const getElectionCategories = async (req, res) => {
    try {
        const electionCategories = await ElectionCategory.find({ });
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

const getElectionCategoriesByElectionId = async (req, res) => {
    const election_id = req.params.id;

    // Validate election_id
    if (!mongoose.Types.ObjectId.isValid(election_id)) {
        return res.status(400).json({
            status_code: 400,
            message: 'Invalid Election Id',
        });
    }
    try {
        const electionCategories = await ElectionCategory.find({ election_id }).populate('election_id');
        // const baseUrl = `${req.protocol}://${req.get('host')}/public/election_images/`;
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

const storeElectionParty = async (req, res) => {
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

const getElectionPartiesByElectionId = async (req, res) => {
    const election_id = req.params.id;

    // Validate election_id
    if (!mongoose.Types.ObjectId.isValid(election_id)) {
        return res.status(400).json({
            status_code: 400,
            message: 'Invalid Election Id',
        });
    }
    try {
        const electionParties = await ElectionParty.find({ election_id }).populate('election_id');
        // const baseUrl = `${req.protocol}://${req.get('host')}/public/election_images/`;
        return res.status(200).json({
            status_code: 200,
            electionParties,
            // baseUrl
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message,
        });
    }
}

const getElectionPartyByPartyId = async (req, res) => {
    try {
        const party_id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(party_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election Party Id',
            });
        }
        const electionParties = await ElectionParty.findOne({ _id: party_id }).populate('candidate_id');
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

const candidateApplyForParty = async (req, res) => {
    try {
        const schema = validation.candidateApplyForParty(req.body);
        if (schema.errored) {
            return res.status(400).json({
                status_code: 400,
                errors: schema.errors
            });
        }

        const { party_id, candidate_id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(party_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election Party Id',
            });
        }
        if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Candidate Id',
            });
        }
        const candidate = await User.findOne({ _id: candidate_id }).exec();
        if (!candidate) {
            return res.status(404).json({
                status_code: 404,
                message: 'User not found',
            });
        }
        const party = await ElectionParty.findOne({ _id: party_id }).exec();
        if (!party) {
            return res.status(404).json({
                status_code: 404,
                message: 'Election Party not found',
            });
        }

        party.candidate_id.push(candidate_id);
        await party.save();
        return res.status(200).json({
            status_code: 200,
            message: 'Candidate applied for party successfully',
        });

    } catch (error) {
        return res.status(401).json({
            status_code: 400,
            errors: error.message,
        });
    }
}


module.exports = {
    storeElection,
    getElections,
    storeElectionCategory,
    getElectionCategoriesByElectionId,
    storeElectionParty,
    getElectionPartiesByElectionId,
    candidateApplyForParty,
    getElectionPartyByPartyId,
    getElectionCategories
}