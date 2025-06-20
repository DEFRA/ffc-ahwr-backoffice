import { authConfig } from "../../../app/config/auth";

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
});
