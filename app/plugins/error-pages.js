module.exports = {
  plugin: {
    name: "error-pages",
    register: (server, _) => {
      server.ext("onPreResponse", (request, h) => {
        const { response } = request;

        if (response.isBoom) {
          const { payload } = response.output;
          const { statusCode, message } = payload;

          request.logger.setBindings({ message });

          if (statusCode >= 400 && statusCode < 500) {
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
