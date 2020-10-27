module.exports.verificationCodeGen = (length) => {
  if (length < 4) return null;

  let chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * (chars.length - 1));

    result += chars.charAt(index);
  }

  return result;
};
