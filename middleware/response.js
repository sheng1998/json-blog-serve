// 响应处理中间件

const response = (req, res, next) => {
  res.sendSuccess = (data = {}, status = 200) => {
    res.status(status).json({
      code: 0,
      message: 'success',
      data: data
    });
  };

  res.sendWarning = (message = 'warning', code = -1, status = 200) => {
    res.status(status).json({
      code,
      message,
      data: {},
    });
  };

  res.sendError = (message, status = 500) => {
    res.status(status).json({ code: 0, message, data: {} });
  };

  next();
}

module.exports = response;
