const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const { cryptoSecretKey, jwtSecretKey } = require('../config/index');

// 字符串解密（解密失败返回原字符串）
const decrypt = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, cryptoSecretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encrypted;
  } catch {
    return encrypted;
  }
}

// 字符串加密
const encrypt = (text) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, cryptoSecretKey);
    return encrypted.toString();
  } catch {
    return text;
  }
}

const jwtSign = (data, expiresIn = '1d') => {
  return jwt.sign(data, jwtSecretKey, { expiresIn });
};

const jwtVerify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) return reject();
      resolve(decoded);
    });
  })
}

module.exports = { decrypt, encrypt, jwtSign, jwtVerify };