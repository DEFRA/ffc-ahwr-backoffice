const authConfig = require("../../../app/config/auth");

describe("cache Config Test", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });
  test("Should pass validation for all fields populated", async () => {
    expect(authConfig).toBeDefined();
  });

  test("Invalid env var throws error", () => {
    try {
      process.env.AADAR_CLIENT_SECRET = null;
      process.env.AADAR_CLIENT_ID = null;
      require("../../../app/config/auth");
    } catch (err) {
      expect(err.message).toBe(
        'The auth config is invalid. "clientSecret" must be a string. "clientId" must be a string',
      );
    }
  });
});
