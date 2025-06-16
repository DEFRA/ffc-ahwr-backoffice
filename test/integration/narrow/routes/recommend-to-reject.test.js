import { StatusCodes } from "http-status-codes";
import { processApplicationClaim } from "../../../../app/api/applications";
import { permissions } from "../../../../app/auth/permissions";
import { generateNewCrumb } from "../../../../app/routes/utils/crumb-cache";
import { createServer } from "../../../../app/server";
import { getCrumbs } from "../../../utils/get-crumbs";

const { administrator, recommender } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/crumb-cache");
jest.mock("../../../../app/auth");

const reference = "AHWR-555A-FD4C";
const url = "/recommend-to-reject";
const encodedErrors =
  "W3sidGV4dCI6IlNlbGVjdCBhbGwgY2hlY2tib3hlcyIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXJlamVjdCIsImtleSI6ImNvbmZpcm0ifV0%3D";

processApplicationClaim.mockResolvedValue(true);

describe("Recommended To Reject test", () => {
  let crumb;

  let auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();
    server = await createServer();
  });

  beforeEach(async () => {
    crumb = await getCrumbs(server);
    jest.clearAllMocks();
  });

  describe(`POST ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 302 when validation fails - no page given for application", async () => {
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&recommendToReject=true&errors=${encodedErrors}`,
      );
    });
    test("returns 302 when validation fails - no page given for claim", async () => {
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        `/view-claim/${reference}?page=1&recommendToReject=true&errors=${encodedErrors}&returnPage=claims`,
      );
    });

    test.each([
      [recommender, "recommender"],
      [administrator, "recommender"],
    ])("Redirects correctly on successful validation for application", async (scope, role) => {
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(generateNewCrumb).toHaveBeenCalledTimes(1);
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`);
    });
    test.each([
      [recommender, "recommender"],
      [administrator, "recommender"],
    ])("Redirects correctly on successful validation for claim", async (scope, role) => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [scope],
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
          claimOrAgreement: "claim",
          page: 1,
          returnPage: "claims",
          confirm: ["checkedAgainstChecklist", "sentChecklist"],
          crumb,
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(generateNewCrumb).toHaveBeenCalledTimes(1);
      expect(res.headers.location).toEqual(`/view-claim/${reference}?page=1&returnPage=claims`);
    });

    test.each([
      [recommender, "recommender"],
      [administrator, "recommender"],
    ])("Redirects correctly on successful validation - no page given", async (scope, role) => {
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
          confirm: ["checkedAgainstChecklist", "sentChecklist"],
          crumb,
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(generateNewCrumb).toHaveBeenCalledTimes(1);
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`);
    });

    test("Returns 302 on wrong payload", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVwiIGRvZXMgbm90IGNvbnRhaW4gMSByZXF1aXJlZCB2YWx1ZShzKSIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXJlamVjdCIsImtleSI6ImNvbmZpcm0ifV0%3D";
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&recommendToReject=true&errors=${errors}`,
      );
    });

    test("Recommended to reject invalid reference", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVswXVwiIGRvZXMgbm90IG1hdGNoIGFueSBvZiB0aGUgYWxsb3dlZCB0eXBlcyIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXJlamVjdCIsImtleSI6MH0seyJ0ZXh0IjoiXCJjb25maXJtXCIgZG9lcyBub3QgY29udGFpbiAxIHJlcXVpcmVkIHZhbHVlKHMpIiwiaHJlZiI6IiNyZWNvbW1lbmQtdG8tcmVqZWN0Iiwia2V5IjoiY29uZmlybSJ9LHsidGV4dCI6IlwicmVmZXJlbmNlXCIgbXVzdCBiZSBhIHN0cmluZyIsImhyZWYiOiIjcmVjb21tZW5kLXRvLXJlamVjdCIsImtleSI6InJlZmVyZW5jZSJ9XQ%3D%3D";
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
          confirm: ["recommendToReject", "sentChecklist"],
          crumb,
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        `/view-agreement/123?page=1&recommendToReject=true&errors=${errors}`,
      );
    });
  });
});
