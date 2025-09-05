import { StatusCodes } from "http-status-codes";

export const healthyRoute = {
  method: "GET",
  path: "/healthy",
  options: {
    auth: false,
    plugins: {
      yar: { skip: true },
    },
    handler: (_, h) => {
      return h.response("ok").code(StatusCodes.OK);
    },
  },
};
