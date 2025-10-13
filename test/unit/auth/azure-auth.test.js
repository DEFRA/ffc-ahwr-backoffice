import { init, getAuthenticationUrl, authenticate, logout } from "../../../app/auth/azure-auth";
import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";
import { config } from "../../../app/config/index.js";

jest.mock("@azure/msal-node");
jest.mock("../../../app/config/index", () => ({
  config: {
    isProd: false,
    auth: { clientId: "abc", clientSecret: "xyz", redirectUrl: "http://localhost/callback" },
  },
}));

describe("msalService", () => {
  let mockMsalInstance;
  const mockRemoveAccount = jest.fn();

  beforeEach(() => {
    mockMsalInstance = {
      getAuthCodeUrl: jest.fn(),
      acquireTokenByCode: jest.fn(),
      getTokenCache: jest.fn(() => ({ removeAccount: mockRemoveAccount })),
    };
    ConfidentialClientApplication.mockImplementation(() => mockMsalInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("creates a new ConfidentialClientApplication with correct config", () => {
      init();

      expect(ConfidentialClientApplication).toHaveBeenCalledWith({
        auth: config.auth,
        system: {
          loggerOptions: {
            loggerCallback: expect.any(Function),
            piiLoggingEnabled: false,
            logLevel: LogLevel.Verbose,
          },
        },
      });
    });
  });

  describe("getAuthenticationUrl", () => {
    it("calls msalClientApplication.getAuthCodeUrl with correct params", () => {
      init();
      mockMsalInstance.getAuthCodeUrl.mockResolvedValueOnce("https://login.microsoft.com/test");

      const result = getAuthenticationUrl();

      expect(mockMsalInstance.getAuthCodeUrl).toHaveBeenCalledWith({
        prompt: "select_account",
        redirectUri: config.auth.redirectUrl,
      });

      // function returns the promise from getAuthCodeUrl
      expect(result).resolves.toBe("https://login.microsoft.com/test");
    });
  });

  describe("authenticate", () => {
    it("calls acquireTokenByCode, creates session, sets cookie, and returns account info", async () => {
      init();

      const token = {
        account: { username: "user@domain.com" },
        idTokenClaims: { roles: ["admin"] },
      };
      mockMsalInstance.acquireTokenByCode.mockResolvedValueOnce(token);

      const auth = { createSession: jest.fn(() => "mock-session-id") };
      const cookieAuth = { set: jest.fn() };

      const result = await authenticate("redirect-code-123", auth, cookieAuth);

      expect(mockMsalInstance.acquireTokenByCode).toHaveBeenCalledWith({
        code: "redirect-code-123",
        redirectUri: config.auth.redirectUrl,
      });

      expect(auth.createSession).toHaveBeenCalledWith(token.account, token.idTokenClaims.roles);
      expect(cookieAuth.set).toHaveBeenCalledWith({ id: "mock-session-id" });
      expect(result).toEqual(["user@domain.com", ["admin"]]);
    });
  });

  describe("logout", () => {
    it("calls removeAccount on token cache", async () => {
      init();
      await logout({ username: "user@domain.com" });

      expect(mockRemoveAccount).toHaveBeenCalledWith({
        username: "user@domain.com",
      });
    });

    it("logs error if removeAccount throws", async () => {
      init();
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockRemoveAccount.mockRejectedValueOnce(new Error("fail"));

      await logout({ username: "bad-user" });

      expect(consoleSpy).toHaveBeenCalledWith("Unable to end session", expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
