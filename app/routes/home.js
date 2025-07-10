export const homeRoute = {
  method: "GET",
  path: "/",
  options: {
    // auth: { scope: [administrator, processor, user, recommender, authoriser] },
    auth: false,
    handler: async (request, h) => {
      // const isAuthenticated = request.auth.isAuthenticated;
      console.log(JSON.stringify(request.auth));
      // if (!isAuthenticated) {
      //   return h.redirect("/login");
      // }

      // Optionally check scope here
      const scope = request.auth?.credentials?.scope ?? [];
      console.log(scope);
      if (
        !["administrator", "processor", "user", "recommender", "authoriser"].some((s) =>
          scope.includes(s),
        )
      ) {
        return h.response("Forbidden").code(403);
      }

      return h.redirect("/claims");
    },
  },
};
