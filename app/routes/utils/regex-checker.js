export const regexChecker = (regex, str) => {
  let regexValue;
  try {
    regexValue = new RegExp(regex);
  } catch (error) {
    return false;
  }

  return regexValue.test(str);
};
