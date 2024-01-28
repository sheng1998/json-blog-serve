const express = require('express');
const router = express.Router();
const DirectoryController = require('../controllers/directoryController');

router.post('', DirectoryController.create);
router.delete('', DirectoryController.delete);
router.put('', DirectoryController.update);
router.get('/list', DirectoryController.list);

module.exports = router;
