const Article = require('../models/Article');

const checkArticle = (req, res) => {
  const { title, content, directoryId } = req.body;
  if (!title) {
    res.sendWarning('请填写文章标题');
    return false;
  } else if (title.length > 120) {
    res.sendWarning('文章标题超长');
    return false;
  } else if (!content || !content.trim()) {
    res.sendWarning('请填写文章正文');
    return false;
  } else if (!directoryId) {
    res.sendWarning('请选择文章所在目录');
    return false;
  }

  return true;
};

const handleReponse = (data, userId, isAdmin) => {
  data.id = data._id.toString();
  data.author = {
    id: data.author._id.toString(),
    username:
      data.author._id.toString() === userId || isAdmin
        ? data.author.unReview?.username || data.author.username
        : data.author.username,
  };
  data.likeCount = data.like.length;
  data.dislikeCount = data.dislike.length;
  data.isLike = data.like.some((item) => item._id.toString() === userId);
  data.isDislike = data.dislike.some((item) => item._id.toString() === userId);
  data.directory = {
    id: data.directoryId._id.toString(),
    name: data.directoryId.name,
  };
  data.tags = data.tags.map((item) => {
    return {
      id: item._id.toString(),
      name:
        item.author.toString() === userId || isAdmin ? item.name : '未审核分类',
    };
  });

  // 移除一些隐私参数
  const secretKeys = [
    '__v',
    '_id',
    'directoryId',
    'isDelete',
    'like',
    'dislike',
    // 'status',
  ];

  for (let i = 0; i < secretKeys.length; i += 1) {
    Reflect.deleteProperty(data, secretKeys[i]);
  }
  return data;
};

const ArticleController = {
  create: async (req, res) => {
    try {
      const { isAdmin } = req;
      // 验证文章信息是否符合规则
      if (!checkArticle(req, res)) return;

      const {
        title,
        content,
        description,
        picture,
        tags,
        directoryId,
        isPublic,
      } = req.body;

      const newArticle = await new Article({
        title,
        content,
        description,
        picture,
        tags,
        directoryId,
        author: req.user.id,
        isPublic,
        status: isAdmin ? 1 : 0,
      }).save();

      res.sendSuccess({ id: newArticle._id });
    } catch (error) {
      throw error;
    }
  },

  delete: async (req, res) => {
    try {
      const { isAdmin } = req;
      const { id } = req.query;

      const article = id ? await Article.findById(id) : null;
      if (!article) {
        return res.sendWarning('文章不存在');
      } else if (!isAdmin && article.author.toString() !== req.user.id) {
        return res.sendError('权限不足', 403);
      }

      await Article.findByIdAndUpdate(id, {
        isDelete: true,
        modifiedTime: Date.now(),
      });
      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },

  update: async (req, res) => {
    try {
      const { isAdmin } = req;
      // 验证文章信息是否符合规则
      if (!checkArticle(req, res)) return;

      const {
        id,
        title,
        content,
        description,
        picture,
        tags,
        directoryId,
        isPublic,
      } = req.body;

      const article = id ? await Article.findById(id) : null;
      if (!article) {
        return res.sendWarning('文章不存在');
      } else if (!isAdmin && article.author.toString() !== req.user.id) {
        return res.sendError('权限不足', 403);
      }

      await Article.findByIdAndUpdate(id, {
        title,
        content,
        tags,
        directoryId,
        description,
        picture,
        isPublic,
        modifiedTime: Date.now(),
      });
      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },

  list: async (req, res) => {
    try {
      const { isAdmin } = req;
      const page = parseInt(req.query.page) || 1; // 分页数量，默认为1
      const size = parseInt(req.query.size) || 10; // 分页大小，默认为10
      const skip = (page - 1) * size;

      const articles = await Article.find({
        isDelete: false,
        $or: [
          { author: req.user?.id, status: 0 },
          { isAdmin: true, status: 0 },
          { status: { $nin: [isAdmin ? 99 : -1, isAdmin ? 99 : 0] } },
        ],
      })
        .skip(skip)
        .limit(size)
        .populate('author')
        .populate('like')
        .populate('dislike')
        .populate('tags')
        .populate('directoryId')
        .lean();

      for (let i = 0; i < articles.length; i++) {
        articles[i] = handleReponse(articles[i], req.user?.id || '', isAdmin);
      }

      res.sendSuccess({ articles });
    } catch (error) {
      throw error;
    }
  },

  // 文章审核以及封装状态更新（仅管理员）
  review: async (req, res) => {
    try {
      if (!req.isAdmin) return res.sendError('权限不足', 403);

      const { id, status } = req.body;
      await Article.findByIdAndUpdate(id, { status });
      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },
};

module.exports = ArticleController;
