const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/my', UserController.getMyProfile);
router.put('/my', UserController.updateMyProfile);
router.post('/create', UserController.create);

module.exports = router;
