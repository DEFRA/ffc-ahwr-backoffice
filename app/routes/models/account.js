import { upperFirstLetter } from "../../lib/display-helper.js";

export const getRows = (request) => {
  const { name, username } = request.auth.credentials.account;
  const roles = request.auth.credentials.scope.map((x) => upperFirstLetter(x)).join(", ");

  return [
    { key: { text: "User" }, value: { text: name } },
    { key: { text: "Username" }, value: { text: username } },
    { key: { text: "Role" }, value: { text: roles } },
  ];
};
