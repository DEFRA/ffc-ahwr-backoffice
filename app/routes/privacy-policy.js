export const privacyPolicyRoute = {
  method: "GET",
  path: "/privacy-policy",
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view("privacy-policy");
    },
  },
};
