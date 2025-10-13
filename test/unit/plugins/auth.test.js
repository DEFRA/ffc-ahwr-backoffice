import { authPlugin, SESSION_AUTH } from "../../../app/plugins/auth.js";

describe("authPlugin", () => {
  describe("validateFunc", () => {
    let validateFunc;

    const fakeCache = {
      get: jest.fn(),
    };

    beforeEach(async () => {
      validateFunc = await getAuthPluginValidateFunc();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("returns { valid: false } when session not found in cache", async () => {
      fakeCache.get.mockResolvedValueOnce(null);

      const result = await validateFunc({}, { id: "session-that-doesnt-exist" });

      expect(fakeCache.get).toHaveBeenCalledWith("session-that-doesnt-exist");
      expect(result).toEqual({ valid: false });
    });

    it("returns { valid: true, credentials } when session exists in cache", async () => {
      const fakeSession = { account: { id: "user1" }, scope: ["admin"] };
      fakeCache.get.mockResolvedValueOnce(fakeSession);

      const result = await validateFunc({}, { id: "session-that-exists" });

      expect(fakeCache.get).toHaveBeenCalledWith("session-that-exists");
      expect(result).toEqual({
        valid: true,
        credentials: {
          account: fakeSession.account,
          scope: fakeSession.scope,
        },
      });
    });

    const getAuthPluginValidateFunc = async () => {
      const server = {
        register: jest.fn(),
        cache: jest.fn(() => fakeCache),
        auth: {
          strategy: jest.fn(),
          default: jest.fn(),
        },
        expose: jest.fn(),
      };

      await authPlugin.plugin.register(server);

      // Get validateFunc from the call to server.auth.strategy
      const strategyCall = server.auth.strategy.mock.calls.find(([name]) => name === SESSION_AUTH);
      return strategyCall[2].validateFunc;
    };
  });

  describe("createSession", () => {
    let createSessionFunc;

    const fakeCache = {
      set: jest.fn(),
    };

    beforeEach(async () => {
      createSessionFunc = await getAuthPluginCreateSessionFunc();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("returns session id successfully saves to cache", async () => {
      fakeCache.set.mockResolvedValueOnce("bar");

      const result = await createSessionFunc({ id: "user1" }, ["admin"]);

      expect(fakeCache.set).toHaveBeenCalledWith(expect.any(String), {
        account: { id: "user1" },
        scope: ["admin"],
      });
      expect(result).toEqual(expect.any(String));
    });

    const getAuthPluginCreateSessionFunc = async () => {
      const server = {
        register: jest.fn(),
        cache: jest.fn(() => fakeCache),
        auth: {
          strategy: jest.fn(),
          default: jest.fn(),
        },
        expose: jest.fn(),
      };

      await authPlugin.plugin.register(server);

      // Grab the exposed createSession function
      const exposeCall = server.expose.mock.calls.find((a) => a[0].createSession !== undefined);
      return exposeCall[0].createSession;
    };
  });
});
