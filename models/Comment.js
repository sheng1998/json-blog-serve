const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema  = new Schema({
  pid: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    default: null,
  },
  knowledgeId: {
    type: Schema.Types.ObjectId,
    ref: 'Knowledge',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  like: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  dislike: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
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
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
