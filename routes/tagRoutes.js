const express = require('express');
const router = express.Router();
const TagController = require('../controllers/tagController');

router.post('', TagController.create);
router.delete('', TagController.delete);
router.put('', TagController.update);
router.get('/list', TagController.list);
router.post('/audit', TagController.audit);

module.exports = router;
