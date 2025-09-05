import { StatusCodes } from "http-status-codes";

export const errorPagesPlugin = {
  plugin: {
    name: "error-pages",
    register: (server, _) => {
      server.ext("onPreResponse", (request, h) => {
        const { response } = request;

        if (response.isBoom) {
          const { payload } = response.output;
          const { statusCode, message } = payload;

          request.logger.setBindings({ message });

          if (
            statusCode >= StatusCodes.BAD_REQUEST &&
            statusCode < StatusCodes.INTERNAL_SERVER_ERROR
          ) {
            return h.view("error-pages/4xx", { payload }).code(statusCode);
          }

          request.logger.error({
            stack: response.data ? response.data.stack : response.stack,
          });

          return h.view("error-pages/500").code(statusCode);
        }

        return h.continue;
      });
    },
  },
};
