// convert createdAt date to the format 2 November 2023
const convertDateToFormattedString = (dateValue) => {
  const date = new Date(dateValue);

  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-GB", options);
};

module.exports = {
  convertDateToFormattedString,
};
