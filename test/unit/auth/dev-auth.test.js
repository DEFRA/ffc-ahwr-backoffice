import { getAuthenticationUrl, authenticate, logout } from "../../../app/auth/dev-auth";

const FAKE_SESSION_ID = "fake-session-id";

const MOCK_AUTH_CREATESESSION = jest.fn().mockReturnValue(FAKE_SESSION_ID);
const MOCK_COOKIE_AUTH_SET = jest.fn();

describe("Dev auth test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAuthenticationUrl without any arguments", () => {
    expect(getAuthenticationUrl()).toBe("/dev-auth");
  });

  test("getAuthenticationUrl with a userId", () => {
    expect(getAuthenticationUrl("abc123")).toBe("/dev-auth?userId=abc123");
  });

  test("authenticate test with no userId argument", async () => {
    const mockAuth = { createSession: MOCK_AUTH_CREATESESSION };
    const mockCookieAuth = { set: MOCK_COOKIE_AUTH_SET };

    const [user, roles] = await authenticate(undefined, mockAuth, mockCookieAuth);

    expect(MOCK_AUTH_CREATESESSION).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH_CREATESESSION).toHaveBeenCalledWith(
      {
        name: "Developer",
        username: "developer@defra.gov.uk",
      },
      ["administrator", "processor", "user", "recommender", "authoriser"],
    );

    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(1);
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledWith({ id: FAKE_SESSION_ID });

    expect(user).toBe("developer@defra.gov.uk");
    expect(roles).toEqual(["administrator", "processor", "user", "recommender", "authoriser"]);
  });

  test("authenticate test with userId provided", async () => {
    const mockAuth = { createSession: MOCK_AUTH_CREATESESSION };
    const mockCookieAuth = { set: MOCK_COOKIE_AUTH_SET };

    const [user, roles] = await authenticate("abc123", mockAuth, mockCookieAuth);

    expect(MOCK_AUTH_CREATESESSION).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH_CREATESESSION).toHaveBeenCalledWith(
      {
        name: "Developer-abc123",
        username: "developer+abc123@defra.gov.uk",
      },
      ["administrator", "processor", "user", "recommender", "authoriser"],
    );

    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(1);
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledWith({ id: FAKE_SESSION_ID });

    expect(user).toBe("developer+abc123@defra.gov.uk");
    expect(roles).toEqual(["administrator", "processor", "user", "recommender", "authoriser"]);
  });

  test("logout test", () => {
    expect(logout).toBeDefined();
  });
});
