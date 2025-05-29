const { administrator, recommender } = require("../../../../app/auth/permissions");
const getCrumbs = require("../../../utils/get-crumbs");

const applications = require("../../../../app/api/applications");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/crumb-cache");
const crumbCache = require("../../../../app/routes/utils/crumb-cache");

const reference = "AHWR-555A-FD4C";
const url = "/recommend-to-pay";

applications.processApplicationClaim = jest.fn().mockResolvedValue(true);

describe("Recommended To Pay test", () => {
  let crumb;

  jest.mock("../../../../app/auth");
  let auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };

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

    test("returns 302 when validation fails for application", async () => {
      const errors =
        "W3sidGV4dCI6IlNlbGVjdCBhbGwgY2hlY2tib3hlcyIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXBheSIsImtleSI6ImNvbmZpcm0ifV0%3D";
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrAgreement: "agreement",
          page: 1,
          confirm: "checkedAgainstChecklist",
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&recommendToPay=true&errors=${errors}`,
      );
    });
    test("returns 302 when validation fails for claim", async () => {
      const errors =
        "W3sidGV4dCI6IlNlbGVjdCBhbGwgY2hlY2tib3hlcyIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXBheSIsImtleSI6ImNvbmZpcm0ifV0%3D";
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
          confirm: "checkedAgainstChecklist",
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `/view-claim/${reference}?page=1&recommendToPay=true&errors=${errors}&returnPage=claims`,
      );
    });

    test.each([recommender, administrator])(
      "Redirects correctly on successful validation for application",
      async (scope) => {
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
            page: 1,
            confirm: ["checkedAgainstChecklist", "sentChecklist"],
            crumb,
          },
        };
        const res = await global.__SERVER__.inject(options);
        expect(res.statusCode).toBe(302);
        expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1);
        expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`);
      },
    );
    test.each([recommender, administrator])(
      "Redirects correctly on successful validation for claim",
      async (scope) => {
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
            page: 1,
            returnPage: "claims",
            confirm: ["checkedAgainstChecklist", "sentChecklist"],
            crumb,
          },
        };
        const res = await global.__SERVER__.inject(options);
        expect(res.statusCode).toBe(302);
        expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1);
        expect(res.headers.location).toEqual(`/view-claim/${reference}?page=1&returnPage=claims`);
      },
    );

    test("Returns 403 when user is not administrator or recomender ", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [],
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
          page: 1,
          confirm: ["checkedAgainstChecklist", "sentChecklist"],
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(403);
    });

    test("Returns 302 on wrong payload", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVwiIGRvZXMgbm90IGNvbnRhaW4gMSByZXF1aXJlZCB2YWx1ZShzKSIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXBheSIsImtleSI6ImNvbmZpcm0ifV0%3D";
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
          confirm: ["sentChecklist"],
          crumb,
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&recommendToPay=true&errors=${errors}`,
      );
    });

    test("Recommended to pay invalid reference", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVswXVwiIGRvZXMgbm90IG1hdGNoIGFueSBvZiB0aGUgYWxsb3dlZCB0eXBlcyIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXBheSIsImtleSI6MH0seyJ0ZXh0IjoiXCJjb25maXJtXCIgZG9lcyBub3QgY29udGFpbiAxIHJlcXVpcmVkIHZhbHVlKHMpIiwiaHJlZiI6IiNyZWNvbW1lbmQtdG8tcGF5Iiwia2V5IjoiY29uZmlybSJ9LHsidGV4dCI6IlwicmVmZXJlbmNlXCIgbXVzdCBiZSBhIHN0cmluZyIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXBheSIsImtleSI6InJlZmVyZW5jZSJ9XQ%3D%3D";
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
          confirm: ["recommendToPay", "sentChecklist"],
          crumb,
        },
      };

      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `/view-agreement/123?page=1&recommendToPay=true&errors=${errors}`,
      );
    });
  });
});
