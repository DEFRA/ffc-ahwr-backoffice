const cheerio = require("cheerio");
const expectPhaseBanner = require("../../../utils/phase-banner-expect");
const {
  administrator,
  processor,
  user,
  recommender,
  authoriser,
} = require("../../../../app/auth/permissions");
const getCrumbs = require("../../../utils/get-crumbs");
const { setEndemicsEnabled } = require("../../../mocks/config");

const applications = require("../../../../app/api/applications");
jest.mock("../../../../app/api/applications");

const reference = "AHWR-555A-FD4C";

describe("Withdraw Application tests when endemics flag is On", () => {
  let crumb;
  const url = "/withdraw-agreement";
  jest.mock("../../../../app/auth");

  beforeEach(async () => {
    crumb = await getCrumbs(global.__SERVER__);
    jest.clearAllMocks();
  });

  describe(`POST ${url} route`, () => {
    test("returns 302 no auth", async () => {
      setEndemicsEnabled(true);
      const options = {
        method: "POST",
        url,
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });

    test("returns 403 when scope is not administrator, recommender or authoriser", async () => {
      setEndemicsEnabled(true);
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [processor, user] },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(403);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("403 - Forbidden");
      expectPhaseBanner.ok($);
    });

    test("returns 403", async () => {
      setEndemicsEnabled(true);
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [processor, user, recommender, authoriser] },
      };
      const options = {
        method: "POST",
        url,
        auth,
        payload: {
          reference,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(403);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("403 - Forbidden");
      expectPhaseBanner.ok($);
    });

    test("returns 403 when duplicate submission - $crumb", async () => {
      setEndemicsEnabled(true);
      const auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const crumb = await getCrumbs(global.__SERVER__);
      const options = {
        auth,
        method: "POST",
        url,
        payload: {
          reference,
          confirm: [
            "SentCopyOfRequest",
            "attachedCopyOfCustomersRecord",
            "receivedCopyOfCustomersRequest",
          ],
          page: 1,
          crumb,
        },
        headers: { cookie: `crumb=${crumb}` },
      };

      const res1 = await global.__SERVER__.inject(options);
      expect(res1.statusCode).toBe(302);
      const res2 = await global.__SERVER__.inject(options);
      expect(res2.statusCode).toBe(403);
      const $ = cheerio.load(res2.payload);
      expectPhaseBanner.ok($);
      expect($(".govuk-heading-l").text()).toEqual("403 - Forbidden");
    });

    test("Approve withdraw application", async () => {
      setEndemicsEnabled(true);
      const auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "post",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          confirm: [
            "SentCopyOfRequest",
            "attachedCopyOfCustomersRecord",
            "receivedCopyOfCustomersRequest",
          ],
          page: 1,
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(applications.updateApplicationStatus).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1`,
      );
    });
    test("Return error, when any of the check boxes are not checked", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVwiIGRvZXMgbm90IGNvbnRhaW4gMSByZXF1aXJlZCB2YWx1ZShzKSIsImhyZWYiOiIjd2l0aGRyYXciLCJrZXkiOiJjb25maXJtIn1d";
      setEndemicsEnabled(true);
      const auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "post",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          page: 1,
          reference,
          confirm: ["SentCopyOfRequest", "attachedCopyOfCustomersRecord"],
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&withdraw=true&errors=${errors}`,
      );
    });
  });
});
