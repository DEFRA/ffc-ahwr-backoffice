import { StatusCodes } from "http-status-codes";
import { permissions } from "../../../../app/auth/permissions";
import { createServer } from "../../../../app/server";

const { administrator } = permissions;

jest.mock("../../../../app/auth");

describe("Home page test", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };

  const method = "GET";
  const url = "/";

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test("redirects to login with no auth", async () => {
    const options = {
      method,
      url,
    };
    const res = await server.inject(options);

    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(res.headers.location).toBe("/login");
  });

  test("redirects to claims with auth", async () => {
    const options = {
      method,
      url,
      auth,
    };
    const res = await server.inject(options);

    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(res.headers.location).toBe("/claims");
  });
});
