import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { permissions } from "../../../../app/auth/permissions";
import { getCrumbs } from "../../../utils/get-crumbs";
import { createServer } from "../../../../app/server";
import { updateApplicationStatus } from "../../../../app/api/applications";
import { StatusCodes } from "http-status-codes";
import { preSubmissionHandler } from "../../../../app/routes/utils/pre-submission-handler";
import boom from "@hapi/boom";

jest.mock("../../../../app/auth");
jest.mock("@hapi/wreck", () => ({
  put: jest.fn().mockReturnValue({}),
}));
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/pre-submission-handler");

preSubmissionHandler.mockImplementation((_arg, h) => h.continue);
updateApplicationStatus.mockResolvedValue(true);

const reference = "AHWR-555A-FD4C";

const { administrator, user, authoriser, recommender } = permissions;

describe("Reject On Hold (move to In Check) Application test", () => {
  let crumb;
  const url = "/move-to-in-check/";

  let auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterAll(() => {
    jest.resetModules();
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("403 - Forbidden");
      phaseBannerOk($);
    });

    test("returns 403 when duplicate submission - $crumb", async () => {
      jest.resetAllMocks();
      preSubmissionHandler.mockImplementationOnce((_arg, h) => h.continue);
      preSubmissionHandler.mockImplementationOnce(() => {
        return boom.forbidden("Duplicate submission");
      });

      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const testCrumb = await getCrumbs(server);
      const options = {
        auth,
        method: "POST",
        url,
        payload: {
          reference,
          claimOrAgreement: "agreement",
          confirm: ["recommendToMoveOnHoldClaim", "updateIssuesLog"],
          page: 1,
          crumb: testCrumb,
        },
        headers: { cookie: `crumb=${testCrumb}` },
      };
      const res1 = await server.inject(options);
      expect(res1.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      const res2 = await server.inject(options);
      expect(res2.statusCode).toBe(StatusCodes.FORBIDDEN);
      const $ = cheerio.load(res2.payload);
      phaseBannerOk($);
      expect($(".govuk-heading-l").text()).toEqual("403 - Forbidden");
      preSubmissionHandler.mockImplementation((_arg, h) => h.continue);
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

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      const logger = expect.any(Object);
      expect(updateApplicationStatus).toHaveBeenCalledWith(reference, "admin", 5, logger);
      expect(updateApplicationStatus).toHaveBeenCalledTimes(1);
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

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
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

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
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

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
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

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(updateApplicationStatus).not.toHaveBeenCalled();
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
    const res = await server.inject(options);
    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(updateApplicationStatus).not.toHaveBeenCalled();
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
    const res = await server.inject(options);
    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(updateApplicationStatus).not.toHaveBeenCalled();
    expect(res.headers.location).toEqual(
      `/view-claim/${reference}?page=1&moveToInCheck=true&errors=${encodedErrors}&returnPage=claims`,
    );
  });
});
