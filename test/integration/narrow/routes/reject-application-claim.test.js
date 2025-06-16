import { createServer } from "../../../../app/server";
import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { permissions } from "../../../../app/auth/permissions";
import { getCrumbs } from "../../../utils/get-crumbs";
import { StatusCodes } from "http-status-codes";
import { preSubmissionHandler } from "../../../../app/routes/utils/pre-submission-handler";
import boom from "@hapi/boom";

jest.mock("../../../../app/auth");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/pre-submission-handler");

preSubmissionHandler.mockImplementation((_arg, h) => h.continue);

const reference = "AHWR-555A-FD4C";
const encodedErrors =
  "W3sidGV4dCI6IlNlbGVjdCBhbGwgY2hlY2tib3hlcyIsImhyZWYiOiIjcmVqZWN0Iiwia2V5IjoiY29uZmlybSJ9XQ%3D%3D";

const { administrator, authoriser } = permissions;

describe("Reject Application test", () => {
  let crumb;
  const url = "/reject-application-claim/";
  let auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };

  let server;

  beforeAll(async () => {
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

    test("returns 403", async () => {
      const options = {
        method: "POST",
        url,
        auth,
        payload: {
          reference,
          claimOrAgreement: "agreement",
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
      const crumb = await getCrumbs(server);
      const options = {
        auth,
        method: "POST",
        url,
        payload: {
          reference,
          claimOrAgreement: "agreement",
          confirm: ["rejectClaim", "sentChecklist"],
          page: 1,
          crumb,
        },
        headers: { cookie: `crumb=${crumb}` },
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
          confirm: ["rejectClaim", "sentChecklist"],
          page: 1,
          crumb,
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`);
    });
    test("Reject claim processed", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: ["authoriser"],
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
          confirm: ["rejectClaim", "sentChecklist"],
          page: 1,
          crumb,
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });
    test("Reject application invalid reference", async () => {
      const errors =
        "W3sidGV4dCI6IlwicmVmZXJlbmNlXCIgbXVzdCBiZSBhIHN0cmluZyIsImhyZWYiOiIjcmVqZWN0Iiwia2V5IjoicmVmZXJlbmNlIn1d";
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
          confirm: ["rejectClaim", "sentChecklist"],
          crumb,
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        `/view-agreement/123?page=1&reject=true&errors=${errors}`,
      );
    });

    test("Reject application claim not processed", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVwiIGRvZXMgbm90IGNvbnRhaW4gMSByZXF1aXJlZCB2YWx1ZShzKSIsImhyZWYiOiIjcmVqZWN0Iiwia2V5IjoiY29uZmlybSJ9XQ%3D%3D";
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrAgreement: "agreement",
          confirm: ["sentChecklist"],
          page: 1,
          crumb,
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&reject=true&errors=${errors}`,
      );
    });
  });

  test("retuns 400 Bad Request", async () => {
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
    expect(res.headers.location).toEqual(
      `/view-agreement/${reference}?page=1&reject=true&errors=${encodedErrors}`,
    );
  });
  test("retuns 400 Bad Request for claim", async () => {
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
    expect(res.headers.location).toEqual(
      `/view-claim/${reference}?page=1&reject=true&errors=${encodedErrors}&returnPage=claims`,
    );
  });
});
