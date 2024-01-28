const Tag = require('../models/Tag');

const TagController = {
  create: async (req, res) => {
    try {
      const { isAdmin } = req;
      const name = (req.body?.name || '').trim();

      if (!name) {
        return res.sendWarning('请输入标签名称');
      }
      if (name.length > 20) {
        return res.sendWarning('标签名称最长不超过20个字符');
      }

      const tag = await Tag.findOne({ name, isDelete: false });

      if (tag) {
        return res.sendWarning('标签已存在');
      }

      const newTag = await new Tag({
        name,
        author: req.user.id,
        status: isAdmin ? 1 : undefined,
      }).save();
      res.sendSuccess({ id: newTag._id });
    } catch (error) {
      throw error;
    }
  },

  delete: async (req, res) => {
    try {
      const { isAdmin } = req;
      const { id } = req.query;

      if (!isAdmin) {
        const tag = await Tag.findById(id).lean();
        tag.author = tag.author.toString();
        if (!tag || tag.author !== req.user.id) {
          return res.sendError('删除失败，权限不足', 403);
        }
      }
      await Tag.findByIdAndUpdate(id, {
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
      let { name, id, status } = req.body;
      name = name?.trim?.() || '';

      if (!name) {
        return res.sendWarning('请输入标签名称');
      }
      if (name.length > 20) {
        return res.sendWarning('标签名称最长不超过20个字符');
      }

      if (!isAdmin) {
        const tag = await Tag.findById(id);
        if (tag && tag.author.toString() !== req.user.id) {
          return res.sendError('权限不足', 403);
        }
      }

      const tag = await Tag.findOne({ name, isDelete: false });

      if (tag && tag._id.toString() !== id) {
        return res.sendWarning('标签已存在');
      }

      await Tag.findByIdAndUpdate(id, {
        name,
        status: isAdmin ? status : undefined,
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
      let tags = await Tag.find({
        isDelete: false,
        $or: [
          // 可以查看自己创建的未审核标签
          { author: req.user?.id, status: 0 },
          // 管理员可以查看未审核标签
          { isAdmin: true, status: 0 },
          // 不是创建者、管理员禁止查看未审核标签
          { status: { $nin: [-1, isAdmin ? -1 : 0] } },
        ],
      });
      tags = tags.map((item) => {
        return {
          id: item._id,
          name: item.name,
          isOwn: item.author.toString() === req.user?.id,
        };
      });
      res.sendSuccess({ tags });
    } catch (error) {
      throw error;
    }
  },

  audit: async (req, res) => {
    try {
      const { isAdmin } = req;
      if (!isAdmin) return res.sendError('权限不足', 403);

      const { id, status } = req.body;

      await Tag.findByIdAndUpdate(id, { status, modifiedTime: Date.now() });
      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },
};

module.exports = TagController;
