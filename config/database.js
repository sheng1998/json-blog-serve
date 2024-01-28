// MongoDB 连接配置

const mongoUrl = 'mongodb://localhost:27017/json_blog';

const mongoConfig = {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
};

module.exports = { mongoUrl, mongoConfig };
