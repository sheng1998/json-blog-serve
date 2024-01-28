const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const User = require('../models/User');
const { decrypt, jwtSign } = require('../helper/index');
const {
  defaultPassword,
  defaultDelay,
  bcryptHashCount,
  cookieMaxAge,
} = require('../config/index');

/**
 * 验证失败说明
 * -1: 用户名验证失败
 * -2: 密码验证失败
 */

// 验证用户名是否符合规范（成功返回false，失败返回失败原因）
const checkUsername = (username, isAdmin) => {
  const max = isAdmin ? 50 : 20;
  const specialCharacters = '@_.-';
  const reg = new RegExp(`^[a-zA-Z0-9${specialCharacters}]{2,${max}}$`);
  if (!reg.test(username)) {
    return `用户名由字母、数字和${specialCharacters}组成，且长度在2~${max}之间`;
  }
  return false;
};

// 验证密码有效性（成功返回false，失败返回失败原因）
const checkPassword = (password) => {
  password = password.toString();
  const length = password.length;
  if (length < 6 || length > 30) {
    return `密码过${length < 6 ? '短' : '长'}，长度要在6~30之间（含）`;
  }
  if (/[^0-9a-zA-Z!@#$&*_:;.,-]/.test(password)) {
    return '密码只能含有数字、字母、指定特殊字符（0-9a-zA-Z!@#$&*_:;.,-）';
  }
  let count = 0;
  if (/[a-z]/.test(password)) {
    count += 1;
  }
  if (/[A-Z]/.test(password)) {
    count += 1;
  }
  if (/[0-9]/.test(password)) {
    count += 1;
  }
  // 只允许含有下面指定的特殊字符
  if (/[!@#$&*_:;.,-]/.test(password)) {
    count += 1;
  }
  if (count < 2) {
    return '密码过于简单，必须包含数字、大写字母、小写字符、特殊字符的两种以上';
  }
  return false;
};

const checkUser = (req, res) => {
  const { username, password } = req.body;
  // 验证用户名是否符合规范
  const invalidReason1 = checkUsername(decrypt(username));
  if (invalidReason1) {
    res.sendWarning(invalidReason1);
    return false;
  }

  // 验证密码是否符合规范
  const invalidReason2 = checkPassword(decrypt(password));
  if (invalidReason2) {
    res.sendWarning(invalidReason2, -2);
    return false;
  }
  return true;
};

const handleReponse = async (user) => {
  const data = user.toObject();
  data.id = data._id;
  data.username = data.unReview?.username || data.username;
  data.biography = data.unReview?.biography || data.biography;
  data.picture = data.unReview?.picture || data.picture;
  // 每3天只能更新一次资料
  if (Date.now() - data.modifiedTime < 3 * 24 * 60 * 60 * 1000) {
    data.canModify = false;
  } else {
    data.canModify = true;
  }

  // 如果临时用户过期了，就修改用户权限
  if (data.expiration <= Date.now() && data.role === 2) {
    await User.findByIdAndUpdate(data.id, { role: 1 });
    data.role = 1;
  }

  // 移除一些隐私参数
  const secretKeys = [
    '__v',
    '_id',
    'expiration',
    'password',
    'user',
    'isDelete',
    'createdTime',
    'modifiedTime',
    'unReview',
  ];
  for (let i = 0; i < secretKeys.length; i += 1) {
    Reflect.deleteProperty(data, secretKeys[i]);
  }
  return data;
};

const findUserByName = async (username) => {
  return await User.findOne({
    $or: [{ username }, { 'unReview.username': username }],
  });
};

const UserController = {
  // 创建用户（仅管理员）
  create: async (req, res) => {
    try {
      const { isAdmin } = req;
      if (!isAdmin) {
        return res.sendError('权限不足', 403);
      }

      req.body.password = defaultPassword;

      let { username, password, role, biography, expiration } = req.body;

      const invalidReason = checkUsername(username, true);
      if (invalidReason) {
        return res.sendWarning(invalidReason);
      }

      // 检查用户名是否存在
      const user = await findUserByName(username);

      if (user) {
        return res.sendWarning('用户已存在');
      }

      // 使用 bcrypt 对密码进行哈希处理
      password = await bcrypt.hash(password, bcryptHashCount);
      expiration = expiration || defaultDelay;

      // 将用户信息保存到数据库
      const newUser = await new User({
        username,
        password,
        role,
        biography,
        expiration,
      }).save();

      res.sendSuccess({ id: newUser._id });
    } catch (error) {
      throw error;
    }
  },

  // 用户注册
  register: async (req, res) => {
    try {
      let { username, password, picture } = req.body;

      // 验证用户信息是否符合规则
      if (!checkUser(req, res)) return;

      // 解密密码，前端需要传过来的密码是加密传输的
      password = decrypt(password);

      // 检查用户名是否存在
      const user = await findUserByName(username);

      if (user) {
        return res.sendWarning('用户已存在');
      }

      // 使用 bcrypt 对密码进行哈希处理
      password = await bcrypt.hash(password, bcryptHashCount);

      // 将用户信息保存到数据库
      const newUser = await new User({
        username: `用户-${uuid.v4()}`,
        password,
        picture: '',
        unReview: { username, picture },
      }).save();

      res.cookie('token', jwtSign({ id: newUser._id }, cookieMaxAge), {
        maxAge: cookieMaxAge,
        httpOnly: true,
      });
      res.sendSuccess({ id: newUser._id });
    } catch (error) {
      throw error;
    }
  },

  // 用户登录
  login: async (req, res) => {
    try {
      let { username, password } = req.body;
      // 解密密码，前端需要传过来的密码是加密传输的
      password = decrypt(password);

      const user = await findUserByName(username);
      if (user) {
        if (bcrypt.compareSync(password, user.password)) {
          res.cookie('token', jwtSign({ id: user._id }, cookieMaxAge), {
            maxAge: cookieMaxAge,
            httpOnly: true,
          });
          const result = await handleReponse(user);
          res.sendSuccess(result);
        } else {
          return res.sendWarning('登陆失败，密码错误', -2);
        }
      } else {
        return res.sendWarning('登陆失败，用户不存在');
      }
    } catch (error) {
      throw error;
    }
  },

  // 退出登录
  logout: async (req, res) => {
    try {
      res.cookie('token', '', { maxAge: -1, httpOnly: true });
      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },

  // 获取个人用户信息
  getMyProfile: async (req, res) => {
    try {
      const result = await handleReponse(req.user);
      res.sendSuccess(result);
    } catch (error) {
      throw error;
    }
  },

  // 修改个人密码
  updateMyPassword: async (req, res) => {
    try {
      let { password } = req.body;
      password = decrypt(password);
      const invalidReason = checkPassword(password);
      if (invalidReason) {
        return res.sendWarning(invalidReason, -2);
      }
      password = await bcrypt.hash(password, bcryptHashCount);
      await User.findByIdAndUpdate(req.user.id, { password });
      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },

  // 修改个人信息
  updateMyProfile: async (req, res) => {
    try {
      if (Date.now() - req.user.modifiedTime < 3 * 24 * 60 * 60 * 1000) {
        return res.sendWarning('每 3 天只能更新一次资料');
      }

      let { username, picture, biography } = req.body;

      const invalidReason = checkUsername(username);
      if (invalidReason) {
        return res.sendWarning(invalidReason);
      }

      // 检查用户名是否存在（如果修改了用户名）
      if (
        username !== req.user.username &&
        username !== req.user?.unReview.username
      ) {
        const user = await findUserByName(username);
        if (user) {
          return res.sendWarning('用户已存在');
        }
      }

      // 如果没有修改就直接返回成功
      if (
        username === req.user.username &&
        picture === req.user.picture &&
        biography === req.user.biography &&
        !req.user.unReview
      ) {
        return res.sendSuccess();
      }

      // 更新数据
      await User.findByIdAndUpdate(req.user.id, {
        modifiedTime: Date.now(),
        unReview: {
          username,
          picture,
          biography,
        },
      });

      res.sendSuccess();
    } catch (error) {
      throw error;
    }
  },
};

module.exports = UserController;
