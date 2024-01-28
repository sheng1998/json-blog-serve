// 用户登录检验中间件
const { jwtVerify } = require('../helper/index');
const User = require('../models/User');

// 白名单，在白名单内的接口不需要校验登陆状态
const whitelist = {
  '/user/register': '*',
  '/user/login': '*',
  '/user/logout': '*',
  '/tag/list': 'get',
  '/directory/list': 'get',
  '/public/favicon.ico': 'get',
  '/public/test/*': ['get'],
};

const authenticate = async (req, res, next) => {
  try {
    let { path, method } = req;
    path = path.toLocaleLowerCase();
    method = method.toLocaleLowerCase();
    req.user = null;
    req.isAdmin = false;

    const token = req.cookies.token || '';
    const result = await jwtVerify(token).catch(() => {});

    // 在数据库中查找用户
    const user = result?.id
      ? await User.findById(result.id).lean()
      : null;

    if (user) {
      // 如果临时用户过期了，就修改用户权限
      if (user.expiration <= Date.now() && user.role === 2) {
        await User.findByIdAndUpdate(user.id, { role: 1 });
        user.role = 1;
      }
      user.id = user._id.toString();
      delete user._id;
      delete user.__v;
      // 将用户信息添加到请求对象中，以便后续中间件和路由使用
      req.user = user;
      if (user.role === 99 || user.role === 2) {
        req.isAdmin = true;
      } else {
        req.isAdmin = false;
      }
      return next();
    }

    // 检查是否在白名单中
    const matchingPaths = Object.keys(whitelist).filter((pattern) => {
      if (pattern.endsWith('*')) {
        return path.startsWith(pattern.slice(0, -1));
      } else {
        return path === pattern;
      }
    });

    if (matchingPaths.length > 0) {
      // 匹配到白名单中的路径
      const matchedPath = matchingPaths[0];
      const matchedMethod = whitelist[matchedPath];
      if (
        matchedMethod === '*' ||
        matchedMethod === method ||
        matchedMethod.includes(method)
      )
        return next();
    }

    res.sendError('身份验证失败', 401);
  } catch (error) {
    throw error;
  }
};

module.exports = authenticate;
