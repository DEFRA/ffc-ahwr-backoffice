import { StatusCodes } from "http-status-codes";

export const cookiePlugin = {
  plugin: {
    name: "cookies",
    register: (server, _) => {
      server.ext("onPreResponse", (request, h) => {
        const statusCode = request.response.statusCode;
        if (
          request.response.variety === "view" &&
          statusCode !== StatusCodes.NOT_FOUND &&
          statusCode !== StatusCodes.INTERNAL_SERVER_ERROR &&
          request.response.source.manager._context
        ) {
          request.response.source.manager._context.user = request.auth?.credentials?.account;
          request.response.source.manager._context.currentPath = request.path;
        }
        return h.continue;
      });
    },
  },
};
