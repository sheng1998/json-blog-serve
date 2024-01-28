// 临时用户默认密码
const defaultPassword = 'temporary@123';
// 临时用户默认时长
const defaultDelay = 3 * 60 * 60 * 1000;

// CryptoJS 密钥，用于密码等加解密传输
const cryptoSecretKey = 'jsonblog2024.com';

// jwt 密钥，用于 cookie 加解密
const jwtSecretKey = 'hello, 我是 jwt 密钥';

// bcrypt加密时hash的次数
const bcryptHashCount = 10;

// cookie 有效期
const cookieMaxAge = 30 * 24 * 60 * 60 * 1000;

module.exports = {
  defaultPassword,
  defaultDelay,
  cryptoSecretKey,
  jwtSecretKey,
  bcryptHashCount,
  cookieMaxAge,
};
