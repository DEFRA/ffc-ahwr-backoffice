import { StatusCodes } from "http-status-codes";
import { createServer } from "../../../../app/server";

describe("Healthy test", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test("GET /healthy route returns 200", async () => {
    const options = {
      method: "GET",
      url: "/healthy",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(StatusCodes.OK);
  });
});
