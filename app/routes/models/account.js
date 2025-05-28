const { upperFirstLetter } = require("../../lib/display-helper");

const getRows = (request) => {
  const { name, username } = request.auth.credentials.account;
  const roles = request.auth.credentials.scope.map((x) => upperFirstLetter(x)).join(", ");

  return [
    { key: { text: "User" }, value: { text: name } },
    { key: { text: "Username" }, value: { text: username } },
    { key: { text: "Role" }, value: { text: roles } },
  ];
};

module.exports = { getRows };
