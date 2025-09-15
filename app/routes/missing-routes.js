import { StatusCodes } from "http-status-codes";

export const missingPagesRoute = {
  method: "GET",
  path: "/{any*}",
  options: {
    auth: false,
    handler: (_request, h) => {
      return h
        .view("error-pages/4xx", {
          payload: { statusCode: StatusCodes.NOT_FOUND, error: "Not Found", message: "Not Found" },
        })
        .code(StatusCodes.NOT_FOUND);
    },
  },
};
