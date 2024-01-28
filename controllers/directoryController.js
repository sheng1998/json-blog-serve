const Directory = require('../models/Directory');

const buildTree = (data) => {
  const map = new Map();
  const tree = [];
  // 将每个节点添加到映射表中，以节点的 _id 作为键
  data.forEach((node) => {
    map.set(node.id, { ...node, children: [] });
  });
  // 遍历数据，将节点添加到对应的父节点的 children 数组中
  data.forEach((node) => {
    const parentNode = map.get(node.pid);
    if (parentNode) {
      parentNode.children.push(map.get(node.id));
    } else {
      tree.push(map.get(node.id));
    }
  });
  return tree;
};

const DirectoryController = {
  create: async (req, res) => {
    try {
      const { isAdmin } = req;
      if (!isAdmin) return res.sendError('权限不足', 403);

      let { pid, name } = req.body;
      name = name?.trim() || '';
      pid = pid?.trim() || '';

      if (!name) {
        return res.sendWarning('请输入目录名称');
      }
      if (name.length > 20) {
        return res.sendWarning('目录名称最长不超过20个字符');
      }

      const directory = await Directory.findOne({ pid, name, isDelete: false });
      if (directory) {
        return res.sendWarning('目录已存在');
      }

      if (pid && !(await Directory.findOne({ _id: pid, isDelete: false }))) {
        return res.sendWarning('父级目录不存在');
      }

      const newDirectory = await new Directory({ pid, name }).save();
      res.sendSuccess({ id: newDirectory._id });
    } catch (error) {
      throw error;
    }
  },

  delete: async (req, res) => {
    try {
      const { isAdmin } = req;
      if (!isAdmin) return res.sendError('权限不足', 403);
      const { id } = req.query;

      let directory = await Directory.findById(id);

      if (!directory) {
        return res.sendWarning('删除失败，目录不存在');
      } else if (directory.name === '其他' && !directory.pid) {
        return res.sendWarning('该目录不允许删除');
      }

      // 删除目录后将其子目录移到“其他”目录内
      directory = await Directory.findOne({
        pid: '',
        name: '其他',
        isDelete: false,
      });
      if (directory && directory._id.toString() !== id) {
        const children = await Directory.find({ pid: id, isDelete: false });
        await Promise.all(
          children.map((item) =>
            Directory.findByIdAndUpdate(item._id, { pid: dir._id })
          )
        );
      }

      await Directory.findByIdAndUpdate(id, {
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
      if (!isAdmin) return res.sendError('权限不足', 403);

      let { name, id } = req.body;
      name = name?.trim?.() || '';

      if (!name) {
        return res.sendWarning('请输入目录名称');
      }
      if (name.length > 20) {
        return res.sendWarning('目录名称最长不超过20个字符');
      }

      let directory = id ? await Directory.findById(id) : '';

      if (!directory) {
        return res.sendWarning('修改失败，目录不存在');
      } else if (directory.name === '其他' && !directory.pid) {
        return res.sendWarning('该目录不允许修改');
      }

      directory = await Directory.findOne({ name, isDelete: false });

      if (directory && directory._id.toString() !== id) {
        return res.sendWarning('目录已存在');
      }

      await Directory.findByIdAndUpdate(id, { name, modifiedTime: Date.now() });

      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },

  list: async (req, res) => {
    try {
      const directorys = await Directory.find({ isDelete: false }).lean();

      const secretKeys = ['__v', '_id', 'isDelete', 'modifiedTime'];
      for (let i = 0; i < directorys.length; i += 1) {
        directorys[i].id = directorys[i]._id.toString();
        directorys[i].pid = directorys[i].pid?.toString();
        for (let j = 0; j < secretKeys.length; j += 1) {
          Reflect.deleteProperty(directorys[i], secretKeys[j]);
        }
      }

      res.sendSuccess({ directorys: buildTree(directorys) });
    } catch (error) {
      throw error;
    }
  },
};

module.exports = DirectoryController;
