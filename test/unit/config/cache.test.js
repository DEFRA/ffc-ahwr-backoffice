const config = require("../../../app/config");

describe("cache Config Test", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });
  const mockKey = "mock-key";
  test("Should pass validation for all fields populated", async () => {
    expect(config).toBeDefined();
  });
  test("Valid env var pass validation", () => {
    process.env.REDIS_HOSTNAME = mockKey;
    const cacheConfig = require("../../../app/config");
    expect(cacheConfig.cache.options.host).toBe(mockKey);
  });

  test("tls return undefined throws error", () => {
    process.env.REDIS_HOSTNAME = mockKey;
    process.env.NODE_ENV = "production";
    const cacheConfig = require("../../../app/config");
    expect(cacheConfig.cache.options.host).toBe(mockKey);
    expect(cacheConfig.cache.options.tls).toStrictEqual({});
  });

  // test('Invalid env var throws error', () => {
  //   process.env.REDIS_HOSTNAME = null
  //   process.env.NODE_ENV = null
  //   expect(() => require('../../../app/config')).toThrow()
  // })
});
