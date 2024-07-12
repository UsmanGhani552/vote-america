const express = require('express');
const bodyParser = require('body-parser');
const VoteController = require('../controllers/voteController');
const voteRoutes = express();

voteRoutes.post('/store-vote',VoteController.storeVote);
voteRoutes.get('/get-votes-by-category_id/:id',VoteController.getVotesByCategoryId);

module.exports = voteRoutes;