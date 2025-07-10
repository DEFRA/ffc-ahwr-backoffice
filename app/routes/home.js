import { permissions } from "../auth/permissions.js";

const { administrator, processor, user, recommender, authoriser } = permissions;

export const homeRoute = {
  method: "GET",
  path: "/",
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    handler: async (_, h) => {
      console.log('made it into the home handler')
      return h.redirect("/claims");
    },
  },
};
