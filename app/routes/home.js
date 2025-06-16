import { permissions } from "../auth/permissions.js";

const { administrator, processor, user, recommender, authoriser } = permissions;

export const homeRoute = {
  method: "GET",
  path: "/",
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    handler: async (_, h) => {
      return h.redirect("/claims");
    },
  },
};
