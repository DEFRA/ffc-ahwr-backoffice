import { getAuthenticationUrl, authenticate, refresh, logout } from "../../../app/auth/dev-auth";
import { permissions } from "../../../app/auth/permissions";

const { administrator, processor, user, recommender, authoriser } = permissions;

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
    const [user, roles] = await authenticate(undefined, {
      set: MOCK_COOKIE_AUTH_SET,
    });
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(1);
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledWith({
      account: {
        name: "Developer",
        username: "developer@defra.gov.uk",
      },
      scope: ["administrator", "processor", "user", "recommender", "authoriser"],
    });

    expect(user).toBe("developer@defra.gov.uk");
    expect(roles).toEqual(["administrator", "processor", "user", "recommender", "authoriser"]);
  });

  test("authenticate test with userId provided", async () => {
    const [user, roles] = await authenticate("abc123", {
      set: MOCK_COOKIE_AUTH_SET,
    });
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(1);
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledWith({
      account: {
        name: "Developer-abc123",
        username: "developer+abc123@defra.gov.uk",
      },
      scope: ["administrator", "processor", "user", "recommender", "authoriser"],
    });

    expect(user).toBe("developer+abc123@defra.gov.uk");
    expect(roles).toEqual(["administrator", "processor", "user", "recommender", "authoriser"]);
  });

  test("refresh test", async () => {
    expect(await refresh(expect.anything(), { set: MOCK_COOKIE_AUTH_SET })).toEqual([
      administrator,
      processor,
      user,
      recommender,
      authoriser,
    ]);
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(1);
  });

  test("logout test", () => {
    expect(logout).toBeDefined();
  });
});
