const Election = require('../models/electionModel');
const ElectionCategory = require('../models/electionCategoryModel');
const validation = require('../utils/validation/election_validation');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const ElectionParty = require('../models/electionPartyModel');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/election_images'), function (error, success) {
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



const storeElection = async (req, res) => {
    try {
        upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }
            try {
                const schema = validation.election(req.body);
                if (schema.errored) {
                    return res.status(401).json({
                        errors: schema.errors
                    });
                }

                const { name } = req.body;

                const image = req.files && req.files.image ? req.files.image[0].filename : null;
                const icon = req.files && req.files.icon ? req.files.icon[0].filename : null;

                const election = new Election({
                    name,
                    image,
                    icon,

                });
                await election.save();
                res.status(201).send({
                    'status': 'Success',
                    'message': 'Election stored successfully.',
                    election,
                });
            } catch (error) {
                return res.status(401).json({
                    status_code: 400,
                    errors: error.message,
                });
            }
        });
    } catch (error) {
        return res.status(401).json({
            status_code: 400,
            errors: error.message,
        });
    }

}

const getElections = async (req, res) => {
    try {
        const elections = await Election.find({});
        const baseUrl = `${req.protocol}://${req.get('host')}/public/election_images/`;
        return res.status(200).json({
            status_code: 200,
            elections,
            baseUrl
        });
    } catch (error) {
        return res.status(401).json({
            status_code: 400,
            errors: error.message,
        });
    }

}

const storeElectionCategory = async (req, res) => {
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }
            try {
                const schema = validation.electionCategory(req.body);
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
                const image = req.file.originalname;

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
                return res.status(401).json({
                    status_code: 400,
                    errors: error.message,
                });
            }
        });
    } catch (error) {
        return res.status(401).json({
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
        const electionCategories = await ElectionCategory.find({election_id}).populate('election_id');
        const baseUrl = `${req.protocol}://${req.get('host')}/public/election_images/`;
        return res.status(200).json({
            status_code: 200,
            electionCategories,
            baseUrl
        });
    } catch (error) {
        return res.status(401).json({
            status_code: 400,
            errors: error.message,
        });
    }
}

const storeElectionParty = async (req, res) => {
    try {
        upload.single('icon')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status_code: 400,
                    error: 'Error uploading file.'
                });
            }
            try {
                // res.json(req.file.originalname);
                const schema = validation.electionParty(req.body);
                if (schema.errored) {
                    return res.status(401).json({
                        errors: schema.errors
                    });
                }

                const { name ,description, election_category_id } = req.body;
                // Check if election_id is a valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(election_category_id)) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Invalid Election Id',
                    });
                }

                const existing_id = await ElectionCategory.findOne({ _id: election_category_id }).exec();
                if (!existing_id) {
                    return res.status(400).json({
                        status_code: 400,
                        message: 'Election not found',
                    })
                }
                const icon = req.file.originalname;

                const electionParty = new ElectionParty({
                    name,
                    icon,
                    description,
                    election_category_id,
                });
                await electionParty.save();
                res.status(200).send({
                    status_code: 200,
                    'message': 'Election Party stored successfully.',
                    electionParty,
                });
            } catch (error) {
                return res.status(401).json({
                    status_code: 400,
                    errors: error.message,
                });
            }
        });
    } catch (error) {
        return res.status(401).json({
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
        const electionParties = await ElectionParty.find({election_id}).populate('election_id');
        const baseUrl = `${req.protocol}://${req.get('host')}/public/election_images/`;
        return res.status(200).json({
            status_code: 200,
            electionParties,
            baseUrl
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
    getElectionPartiesByElectionId

}