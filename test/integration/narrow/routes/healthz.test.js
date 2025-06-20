import { StatusCodes } from "http-status-codes";
import { createServer } from "../../../../app/server";

describe("Healthz test", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test("GET /healthz route returns 200", async () => {
    const options = {
      method: "GET",
      url: "/healthz",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(StatusCodes.OK);
  });
});
