const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const articleSchema  = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  picture: {
    type: String,
    default: '',
  },
  directoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Directory',
    default: null,
  },
  tags: {
    type: [Schema.Types.ObjectId],
    ref: 'Tag',
  },
  like: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  dislike: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  readCount: {
    type: Number,
    default: 0,
  },
  // 是否公开
  isPublic: {
    type: Boolean,
    default: true,
  },
  /**
   * 0: 待审核状态，仅管理员和自己可见
   * 1: 所有用户可见（管理员创建的默认为1）
   * -1: 被封禁，仅管理员可见
   */
  status: {
    type: Number,
    default: 0,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  createdTime: {
    type: Number,
    default: Date.now,
  },
  modifiedTime: {
    type: Number,
    default: Date.now,
  },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
