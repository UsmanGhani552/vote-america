const validation = require('../utils/validation/vote_validation');
const Vote = require('../models/voteModel');
const mongoose = require('mongoose');

const storeVote = async (req, res) => {
    try {
        const schema = validation.storeVote(req.body);
        if (schema.errored) {
            return res.status(401).json({
                errors: schema.errors
            });
        }
        const { voter_id, candidate_id, election_party_id, election_category_id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(election_party_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election Party Id',
            });
        }
        if (!mongoose.Types.ObjectId.isValid(election_category_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election category Id',
            });
        }
        if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Candidate Id',
            });
        }
        if (!mongoose.Types.ObjectId.isValid(voter_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Voter Id',
            });
        }
        const vote = new Vote({
            voter_id: voter_id,
            candidate_id: candidate_id,
            election_party_id: election_party_id,
            election_category_id: election_category_id,
        })
        if (await vote.save()) {
            return res.status(200).json({
                status_code: 200,
                message: 'Voted Successfully',
            });
        }

    } catch (error) {
        return res.status(401).json({
            status_code: 400,
            errors: error.message,
        });
    }
}

const getVotesByCategoryId = async (req, res) => {
    try {
        const election_category_id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(election_category_id)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid Election Category Id',
            });
        }

        const votes = await Vote.aggregate([
            {
                $match: {
                    election_category_id: new mongoose.Types.ObjectId(election_category_id)
                }
            },
            {
                $group: {
                    "_id": "$candidate_id",
                    vote_count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'candidate'
                }
            },
            {
                $project: {
                    candidate: { $arrayElemAt: ["$candidate", 0] },
                    vote_count: 1
                }
            },
            { $sort: { vote_count: -1 } }
        ]);
        const totalVotes = votes.reduce((acc, vote) => acc + vote.vote_count, 0);
        const winnerVoteCount = votes.length > 0 ? votes[0].vote_count : 0;
        // return res.send({winnerVoteCount});

        const results = votes.map((vote, index) => {
            const winPercentage = ((vote.vote_count / totalVotes) * 100).toFixed(2);
            return {
                candidate: vote.candidate,
                vote_count: vote.vote_count,
                win_percentage: winPercentage,
                status: index === 0 && vote.vote_count === winnerVoteCount ? 'WIN' : 'LOSS'
            };
        });

        return res.status(200).json({
            status_code: 200,
            results,
        });

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            errors: error.message,
        });
    }
};
module.exports = {
    storeVote,
    getVotesByCategoryId
}