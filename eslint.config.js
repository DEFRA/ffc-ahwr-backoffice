const neostandard = require("neostandard");
const eslintConfigPrettier = require("eslint-config-prettier/flat");

module.exports = [
  ...neostandard({
    env: ["node", "jest", "browser"],
    ignores: ["app/frontend/dist/**/*"],
  }),
  eslintConfigPrettier,
];
