const express = require('express');
const bodyParser = require('body-parser');
const ElectionController = require('../controllers/electionController');
const electionRoutes = express();

// electionRoutes.use(bodyParser.json());
// electionRoutes.use(bodyParser.text({ extended: true }));

electionRoutes.post('/store-election', ElectionController.storeElection);
electionRoutes.get('/get-elections', ElectionController.getElections);
electionRoutes.post('/store-election-category', ElectionController.storeElectionCategory);
electionRoutes.get('/get-election-categories-by-election-id/:id', ElectionController.getElectionCategoriesByElectionId);
electionRoutes.post('/store-election-party', ElectionController.storeElectionParty);
electionRoutes.get('/get-election-parties-by-election-id/:id', ElectionController.getElectionPartiesByElectionId);
electionRoutes.post('/candidate-apply-for-party', ElectionController.candidateApplyForParty);
electionRoutes.get('/get-election-party-by-party-id/:id', ElectionController.getElectionPartyByPartyId);

module.exports = electionRoutes;