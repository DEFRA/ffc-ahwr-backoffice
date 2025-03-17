const { administrator } = require("../../../../app/auth/permissions");

describe("Home page test", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };
  jest.mock("../../../../app/auth");
  const method = "GET";
  const url = "/";

  test("redirects to login with no auth", async () => {
    const options = {
      method,
      url,
    };
    const res = await global.__SERVER__.inject(options);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  test("redirects to claims with auth", async () => {
    const options = {
      method,
      url,
      auth,
    };
    const res = await global.__SERVER__.inject(options);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/claims");
  });
});
