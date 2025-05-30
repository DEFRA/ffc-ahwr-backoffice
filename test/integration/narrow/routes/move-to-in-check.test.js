const cheerio = require("cheerio");
const expectPhaseBanner = require("../../../utils/phase-banner-expect");
const {
  administrator,
  user,
  authoriser,
  recommender,
} = require("../../../../app/auth/permissions");
const getCrumbs = require("../../../utils/get-crumbs");

const reference = "AHWR-555A-FD4C";

describe("Reject On Hold (move to In Check) Application test", () => {
  let applications;
  let crumb;
  const url = "/move-to-in-check/";
  jest.mock("../../../../app/auth");

  jest.mock("@hapi/wreck", () => ({
    put: jest.fn().mockReturnValue({}),
  }));
  let auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };

  beforeAll(() => {
    jest.mock("../../../../app/api/applications");
    jest.mock("../../../../app/api/claims");
    applications = require("../../../../app/api/applications");

    applications.updateApplicationStatus = jest.fn().mockResolvedValue(true);
  });

  afterAll(() => {
    jest.resetModules();
  });

  beforeEach(async () => {
    crumb = await getCrumbs(global.__SERVER__);
    jest.clearAllMocks();
  });

  describe(`POST ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url,
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });

    test("returns 403", async () => {
      const options = {
        method: "POST",
        url,
        auth,
        payload: {
          reference,
          claimOrAgreement: "application",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(403);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("403 - Forbidden");
      expectPhaseBanner.ok($);
    });

    test("returns 403 when duplicate submission - $crumb", async () => {
      auth = {
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
          claimOrAgreement: "agreement",
          confirm: ["recommendToMoveOnHoldClaim", "updateIssuesLog"],
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

    test.each([
      [authoriser, "authoriser"],
      [administrator, "authoriser"],
      [recommender, "authoriser"],
    ])("Reject application claim processed", async (scope, role) => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [scope],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrAgreement: "agreement",
          confirm: ["recommendToMoveOnHoldClaim", "updateIssuesLog"],
          page: 1,
          crumb,
        },
      };

      const res = await global.__SERVER__.inject(options);
      const logger = expect.any(Object);
      expect(applications.updateApplicationStatus).toHaveBeenCalledWith(
        reference,
        "admin",
        5,
        logger,
      );
      expect(applications.updateApplicationStatus).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`);
    });
    test.each([authoriser, administrator, recommender])("Reject claim processed", async (scope) => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [scope],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrAgreement: "claim",
          confirm: ["recommendToMoveOnHoldClaim", "updateIssuesLog"],
          page: 1,
          returnPage: "claims",
          crumb,
        },
      };

      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(`/view-claim/${reference}?page=1&returnPage=claims`);
    });

    test("Reject application invalid reference", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          page: 1,
          reference: 123,
          claimOrAgreement: "agreement",
          confirm: ["recommendToMoveOnHoldClaim", "updateIssuesLog"],
          crumb,
        },
      };

      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
      const encodedErrors =
        "W3sidGV4dCI6IlwicmVmZXJlbmNlXCIgbXVzdCBiZSBhIHN0cmluZyIsImhyZWYiOiIjbW92ZS10by1pbi1jaGVjayIsImtleSI6InJlZmVyZW5jZSJ9XQ%3D%3D";

      expect(res.headers.location).toEqual(
        `/view-agreement/123?page=1&moveToInCheck=true&errors=${encodedErrors}`,
      );
    });

    test("Reject application with one unchecked checkbox", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          page: 1,
          reference,
          claimOrAgreement: "agreement",
          confirm: ["recommendToMoveOnHoldClaim"],
          crumb,
        },
      };

      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
      const encodedErrors =
        "W3sidGV4dCI6IlwiY29uZmlybVwiIGRvZXMgbm90IGNvbnRhaW4gMSByZXF1aXJlZCB2YWx1ZShzKSIsImhyZWYiOiIjbW92ZS10by1pbi1jaGVjayIsImtleSI6ImNvbmZpcm0ifV0%3D";
      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&moveToInCheck=true&errors=${encodedErrors}`,
      );
    });

    test("Reject application invalid permission", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [user],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          page: 1,
          reference,
          claimOrAgreement: "agreement",
          confirm: ["recommendToMoveOnHoldClaim", "updateIssuesLog"],
          crumb,
        },
      };

      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(403);
    });

    test("Reject application claim not processed", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrAgreement: "agreement",
          page: 1,
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
      expect(applications.updateApplicationStatus).not.toHaveBeenCalled();
    });
  });

  test("returns 400 Bad Request", async () => {
    const options = {
      method: "POST",
      url,
      auth,
      headers: { cookie: `crumb=${crumb}` },
      payload: {
        reference,
        claimOrAgreement: "agreement",
        page: 1,
        crumb,
      },
    };
    const res = await global.__SERVER__.inject(options);
    expect(res.statusCode).toBe(302);
    expect(applications.updateApplicationStatus).not.toHaveBeenCalled();
  });
  test("Redirect to view claim with 302 status", async () => {
    const encodedErrors =
      "W3sidGV4dCI6IlNlbGVjdCBhbGwgY2hlY2tib3hlcyIsImhyZWYiOiIjbW92ZS10by1pbi1jaGVjayIsImtleSI6ImNvbmZpcm0ifV0%3D";
    const options = {
      method: "POST",
      url,
      auth,
      headers: { cookie: `crumb=${crumb}` },
      payload: {
        reference,
        claimOrAgreement: "claim",
        page: 1,
        returnPage: "claims",
        crumb,
      },
    };
    const res = await global.__SERVER__.inject(options);
    expect(res.statusCode).toBe(302);
    expect(applications.updateApplicationStatus).not.toHaveBeenCalled();
    expect(res.headers.location).toEqual(
      `/view-claim/${reference}?page=1&moveToInCheck=true&errors=${encodedErrors}&returnPage=claims`,
    );
  });
});
