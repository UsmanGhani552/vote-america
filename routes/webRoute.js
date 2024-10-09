const express = require('express');
const webRoutes = express();
const bodyParser = require('body-parser');
const authController = require('../controllers/web/authController');
const electionController = require('../controllers/web/electionController');
const electionCategoryController = require('../controllers/web/electionCategoryController');
const userController = require('../controllers/web/userController');
const candidateController = require('../controllers/web/candidateController');
const partyController = require('../controllers/web/partyController');
const { verifyToken } = require('../middleware/auth');

//auth
webRoutes.post('/login',authController.login);

// elections
webRoutes.get('/elections',verifyToken,electionController.index);
webRoutes.post('/election/store',verifyToken,electionController.store);
webRoutes.post('/election/update/:id',verifyToken,electionController.update);
webRoutes.get('/election/delete/:id',verifyToken,electionController.destroy);

// election categories
webRoutes.get('/election/categories',verifyToken,electionCategoryController.index);
webRoutes.post('/election/category/store',verifyToken,electionCategoryController.store);
webRoutes.post('/election/category/update/:id',verifyToken,electionCategoryController.update);
webRoutes.get('/election/category/delete/:id',verifyToken,electionCategoryController.destroy);

// election parties
webRoutes.get('/election/parties',verifyToken,partyController.index);
webRoutes.post('/election/party/store',verifyToken,partyController.store);
webRoutes.post('/election/party/update/:id',verifyToken,partyController.update);
webRoutes.get('/election/party/delete/:id',verifyToken,partyController.destroy);

// user
webRoutes.get('/users',verifyToken,userController.index);
webRoutes.post('/user/change/status/:user_id',verifyToken,userController.changeStatus);
// webRoutes.post('/election/party/update/:id',verifyToken,partyController.update);
// webRoutes.get('/election/party/delete/:id',verifyToken,partyController.destroy);

// candidate
webRoutes.get('/candidates',verifyToken,candidateController.index);
webRoutes.post('/candidate/create',verifyToken,candidateController.create);
webRoutes.post('/candidate/change/status/:candidate_id',verifyToken,candidateController.changeStatus);
// webRoutes.post('/election/party/update/:id',verifyToken,candidateController.update);
webRoutes.get('/candidate/delete/:id',verifyToken,candidateController.destroy);

module.exports = webRoutes;
