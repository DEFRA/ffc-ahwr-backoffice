import { createServer } from "../../../../app/server";
import { auth } from "../../../../app/auth";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/auth");
describe("Authentication route tests", () => {
  let server;
  const url = "/dev-auth";

  beforeAll(async () => {
    server = await createServer();
    jest.clearAllMocks();
  });

  describe("Authenticate GET request", () => {
    const method = "GET";
    test(`GET ${url} route redirects to '/'`, async () => {
      const options = {
        method,
        url,
      };

      const response = await server.inject(options);
      expect(response.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(response.headers.location).toEqual("/");
    });

    test(`GET ${url} route returns a 500 error due to try catch`, async () => {
      auth.authenticate.mockImplementation(() => {
        throw new Error();
      });
      const options = {
        method,
        url,
      };

      const response = await server.inject(options);
      expect(response.statusCode).toBe(500);
    });
  });
});
