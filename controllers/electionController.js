const User = require('../models/userModel');
const Election = require('../models/electionModel');
const ElectionCategory = require('../models/electionCategoryModel');
const validation = require('../utils/validation/election_validation');
const path = require('path');
const mongoose = require('mongoose');
const ElectionParty = require('../models/electionPartyModel');
const upload = require('./mediaController');
const { populate } = require('../models/voteModel');

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

const getElectionPartiesByElectionCategoryId = async (req, res) => {
    const election_category_id = req.params.id;

    // Validate election_id
    if (!mongoose.Types.ObjectId.isValid(election_category_id)) {
        return res.status(400).json({
            status_code: 400,
            message: 'Invalid Election Id',
        });
    }
    try {
        const electionParties = await ElectionParty.find({ election_category_id }).populate('election_category_id');
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
        const categoryId = req.query.category_id; 

       
        if (!mongoose.Types.ObjectId.isValid(party_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election Party Id',
            });
        }

      
        if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Category Id',
            });
        }

       
        const electionParty = await ElectionParty.findOne({ _id: party_id })
            .populate({
                path: 'candidates', 
                select: '-category_id',
                    populate: {
                        path: 'candidate_id',
                        select: 'first_name last_name image  bio type', 
                    }
                        
            });

        if (!electionParty) {
            return res.status(404).json({
                status_code: 404,
                message: 'Election Party not found',
            });
        }

        // Filter candidates if categoryId is provided
        let filteredCandidates = electionParty.candidates;

        if (categoryId) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                candidate.category_id.some(
                    category => category.toString() === categoryId
                )
            );
        }

        // Respond with the filtered results (candidates filtered by category_id)
        return res.status(200).json({
            status_code: 200,
            electionParty: {
                _id: electionParty._id,
                name: electionParty.name,
                icon: electionParty.icon,
                description: electionParty.description,
                candidates: filteredCandidates,  // Only the filtered candidates
            },
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            errors: error.message,
        });
    }
};






const candidateApplyForParty = async (req, res) => {
    try {
        // Validate request body
        const schema = validation.candidateApplyForParty(req.body);
        if (schema.errored) {
            return res.status(400).json({
                status_code: 400,
                errors: schema.errors
            });
        }

        const { party_id, candidate_id, category_id } = req.body;

        // Validate IDs
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
        if (!mongoose.Types.ObjectId.isValid(category_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Category Id',
            });
        }

        // Check if candidate exists
        const candidate = await User.findOne({ _id: candidate_id }).exec();
        if (!candidate) {
            return res.status(404).json({
                status_code: 404,
                message: 'User not found',
            });
        }

        // Check if party exists
        const party = await ElectionParty.findOne({ _id: party_id }).exec();
        if (!party) {
            return res.status(404).json({
                status_code: 404,
                message: 'Election Party not found',
            });
        }

        // Check if the category belongs to the party
        const isCategoryValid = party.election_category_id.some(
            id => id.toString() === category_id
        );
        if (!isCategoryValid) {
            return res.status(400).json({
                status_code: 400,
                message: 'This category does not belong to the specified party',
            });
        }

        // Check if the candidate is already added to this category
        const existingCandidate = party.candidates.find(
            item => item.candidate_id.toString() === candidate_id && item.category_id.toString() === category_id
        );

        if (existingCandidate) {
            return res.status(400).json({
                status_code: 400,
                message: 'Candidate is already applied for this category in the party',
            });
        }

        // Add candidate with category mapping
        party.candidates.push({ candidate_id, category_id });
        await party.save();

        return res.status(200).json({
            status_code: 200,
            message: 'Candidate applied for party successfully',
        });

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            errors: error.message,
        });
    }
};


module.exports = {
    storeElection,
    getElections,
    storeElectionCategory,
    getElectionCategoriesByElectionId,
    storeElectionParty,
    getElectionPartiesByElectionCategoryId,
    candidateApplyForParty,
    getElectionPartyByPartyId,
    getElectionCategories
}