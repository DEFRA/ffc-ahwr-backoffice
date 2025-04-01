const cheerio = require("cheerio");
const expectPhaseBanner = require("../../../utils/phase-banner-expect");
const getCrumbs = require("../../../utils/get-crumbs");
const { administrator } = require("../../../../app/auth/permissions");
const sessionMock = require("../../../../app/session");
const claimData = require("../../../data/claims.json");

jest.mock("../../../../app/session");
const claims = require("../../../../app/api/claims");
jest.mock("../../../../app/api/claims");
const pagination = require("../../../../app/pagination");
jest.mock("../../../../app/pagination");

jest.mock("../../../../app/routes/models/claim-list");

pagination.getPagination = jest.fn().mockReturnValue({
  limit: 10,
  offset: 0,
});

pagination.getPagingData = jest.fn().mockReturnValue({
  page: 1,
  totalPages: 1,
  total: 1,
  limit: 10,
});
claims.getClaims = jest.fn().mockReturnValue(claimData);

describe("Claims data tests", () => {
  const getUrl = (reference) => `/claims/${reference}/data`;

  jest.mock("../../../../app/auth");
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: "test user" },
  };

  describe(`POST /claims/{reference}/data route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url: getUrl('AAA'),
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });

    test("returns 200", async () => {
      const options = {
        method: "POST",
        url: getUrl(),
        auth,
        payload: {

        }
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Claims");
      expect($("title").text()).toContain("AHWR Claims");
      expect(sessionMock.getClaimSearch).toHaveBeenCalledTimes(2);
      expectPhaseBanner.ok($);
    });
  });
});
