const express = require('express');
const router = express.Router();
const ArticleController = require('../controllers/articleController');

router.post('', ArticleController.create);
router.delete('', ArticleController.delete);
router.put('', ArticleController.update);
router.get('/list', ArticleController.list);
router.put('/review', ArticleController.review); // 文章审核以及封装状态更新

module.exports = router;
