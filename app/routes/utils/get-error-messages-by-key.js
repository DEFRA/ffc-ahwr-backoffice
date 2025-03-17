const getErrorMessagesByKey = (errors) =>
  errors.reduce((obj, { key, text }) => {
    return {
      ...obj,
      [key]: { text },
    };
  }, {});

module.exports = { getErrorMessagesByKey };
