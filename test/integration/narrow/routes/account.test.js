const cheerio = require("cheerio");
const expectPhaseBanner = require("../../../utils/phase-banner-expect");
const { upperFirstLetter } = require("../../../../app/lib/display-helper");
const {
  administrator,
  processor,
  user,
  recommender,
  authoriser,
} = require("../../../../app/auth/permissions");

describe("Account page test", () => {
  const url = "/account";
  jest.mock("../../../../app/auth");
  let auth = {
    strategy: "session-auth",
    credentials: { scope: ["administrator"], account: {} },
  };

  beforeAll(() => {
    jest.clearAllMocks();
  });

  describe(`GET ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "GET",
        url,
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });
    test.each([
      ["Test user 1", "user1@test", [administrator]],
      ["Test user 2", "user2@test", [processor]],
      ["Test user 3", "user3@test", [user]],
      ["Test user 4", "user4@test", [recommender]],
      ["Test user 5", "user5@test", [authoriser]],
      ["Test user 6", "user6@test", [administrator, processor, user, recommender, authoriser]],
    ])("returns 200, page loads successfully", async (name, username, roles) => {
      auth = {
        strategy: "session-auth",
        credentials: { scope: roles, account: { name, username } },
      };
      const options = {
        method: "GET",
        url,
        auth,
      };
      const response = await global.__SERVER__.inject(options);
      expect(response.statusCode).toBe(200);

      const $ = cheerio.load(response.payload);
      expect($(".govuk-summary-list__row").length).toEqual(3);
      expect($(".govuk-summary-list__key").eq(0).text()).toMatch("User");
      expect($(".govuk-summary-list__value").eq(0).text()).toMatch(user);
      expect($(".govuk-summary-list__key").eq(1).text()).toMatch("Username");
      expect($(".govuk-summary-list__value").eq(1).text()).toMatch(username);
      expect($(".govuk-summary-list__key").eq(2).text()).toMatch("Role");
      expect($(".govuk-summary-list__value").eq(2).text()).toMatch(
        roles.map((x) => upperFirstLetter(x)).join(", "),
      );

      expectPhaseBanner.ok($);
    });
  });
});
