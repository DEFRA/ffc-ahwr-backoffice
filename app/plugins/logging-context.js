import { getUserDetails } from "../session/index.js";

export function addBindings(request) {
  const username = getUserDetails(request, "user");
  const roles = getUserDetails(request, "roles");

  request.logger.setBindings({
    user: username,
    roles,
  });
}

export const loggingContextPlugin = {
  plugin: {
    name: "logging-context",
    register: (server, _) => {
      server.ext("onPreHandler", (request, h) => {
        if (!request.path.includes("assets") && !request.path.includes("health")) {
          addBindings(request);
        }

        return h.continue;
      });
    },
  },
};
