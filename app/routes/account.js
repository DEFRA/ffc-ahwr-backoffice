import { getRows } from "./models/account.js";

export const accountRoute = {
  method: "GET",
  path: "/account",
  options: {
    handler: async (request, h) => {
      return h.view("account", { rows: getRows(request) });
    },
  },
};
