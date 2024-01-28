const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagSchema  = new Schema({
  name: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
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
  modifiedTime: {
    type: Number,
    default: Date.now,
  },
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
