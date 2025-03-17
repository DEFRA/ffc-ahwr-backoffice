const regexChecker = (regex, str) => {
  let isValid = true;
  let regexValue;
  try {
    regexValue = new RegExp(regex);
  } catch (error) {
    isValid = false;
    return isValid;
  }

  return regexValue.test(str);
};

module.exports = regexChecker;
