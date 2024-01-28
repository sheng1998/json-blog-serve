const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const response = require('./middleware/response');
const authenticate = require('./middleware/authenticate');
const { mongoUrl, mongoConfig } = require('./config/database');

const app = express();
const port = 3003;

// 连接到 MongoDB 数据库
mongoose.connect(mongoUrl, mongoConfig);

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  console.log('数据库连接成功!');
});

// 解析 Cookie
app.use(cookieParser());
// 使用 Morgan 进行日志记录
app.use(morgan('dev'));
// 解析请求中的 JSON 数据
app.use(express.json());

// 使用自定义中间件
app.use(response);
app.use(authenticate);

// 设置静态文件目录
app.use('/public', express.static(path.join(__dirname, 'public')));

// 设置路由
const userRoutes = require('./routes/userRoutes');
const tagRoutes = require('./routes/tagRoutes');
const directoryRoutes = require('./routes/directoryRoutes');
const articleRoutes = require('./routes/articleRoutes');

app.use('/user', userRoutes);
app.use('/tag', tagRoutes);
app.use('/directory', directoryRoutes);
app.use('/article', articleRoutes);

// 处理未匹配的路由请求
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err);
  res.sendError(err.message, undefined, err.status || 500);
});

// 启动 Express 应用
app.listen(port, () => {
  console.log(`项目启动成功，请访问http://127.0.0.1:${port}\n\n\n\n\n`);
});
