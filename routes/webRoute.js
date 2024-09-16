const express = require('express');
const webRoutes = express();
const bodyParser = require('body-parser');
const authController = require('../controllers/web/authController');
const electionController = require('../controllers/web/electionController');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

//auth
webRoutes.post('/login',authController.login);

// web
webRoutes.get('/elections',verifyToken,electionController.index);
webRoutes.post('/election/store',verifyToken,electionController.store);
webRoutes.post('/election/update/:id',verifyToken,electionController.update);
webRoutes.get('/election/delete/:id',verifyToken,electionController.destroy);

module.exports = webRoutes;
