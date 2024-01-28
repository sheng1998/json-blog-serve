const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    // 用户简介
    biography: {
      type: String,
      default: '',
    },
    picture: {
      type: String,
      default: '',
    },
    /**
     * 权限等级
     * -2: 禁止操作用户，只能查看文章和评论，不能点赞点踩
     * -1: 禁言用户，只能查看文章和评论，不可发表文章和评论，允许点赞点踩
     * 0: 普通用户，不可发表文章和评论，但是可以查看文章和点赞、点踩等无输入型操作
     * 1: 一级用户，有权限发表文章和评论，但是需要管理员审批
     * 2: 临时言论自由用户，有权限发表文章和评论，有效期内不需要管理员审批，账号到期后需要管理员审批
     * 99: 管理员，可配置用户权限
     */
    role: {
      type: Number,
      default: 1,
    },
    /**
     * 用户资料审核状态
     * 0: 待审核状态，仅管理员和自己可见
     * 1: 所有用户可见（管理员创建的默认为1）
     */
    status: {
      type: Number,
      default: 0,
    },
    // 临时用户过期时间
    expiration: {
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
    // 注意：每3天只能更新一次资料
    modifiedTime: {
      type: Number,
      default: 0,
    },
    // 待审核资料
    unReview: {
      type: Object,
      default: null,
    },
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
