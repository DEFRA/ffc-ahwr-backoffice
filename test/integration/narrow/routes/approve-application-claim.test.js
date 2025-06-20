import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { permissions } from "../../../../app/auth/permissions";
import { getCrumbs } from "../../../utils/get-crumbs";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";
import { preSubmissionHandler } from "../../../../app/routes/utils/pre-submission-handler";
import boom from "@hapi/boom";

jest.mock("../../../../app/auth");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/pre-submission-handler");

preSubmissionHandler.mockImplementation((_arg, h) => h.continue);

const { administrator, authoriser } = permissions;

const reference = "AHWR-555A-FD4C";

describe("/approve-application-claim", () => {
  let crumb;
  const url = "/approve-application-claim/";

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
          confirm: ["approveClaim", "sentChecklist"],
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

    test("Approve application invalid reference", async () => {
      const errors =
        "W3sidGV4dCI6IlwicmVmZXJlbmNlXCIgbXVzdCBiZSBhIHN0cmluZyIsImhyZWYiOiIjYXV0aG9yaXNlIiwia2V5IjoicmVmZXJlbmNlIn1d";
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
          claimOrAgreement: "agreement",
          page: 1,
          reference: 123,
          confirm: ["approveClaim", "sentChecklist"],
          crumb,
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        `/view-agreement/123?page=1&approve=true&errors=${errors}`,
      );
    });

    test.each([
      [authoriser, "authoriser"],
      [administrator, "authoriser"],
    ])("Approve application claim processed", async (scope, role) => {
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
          confirm: ["approveClaim", "sentChecklist"],
          page: 1,
          crumb,
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`);
    });

    test.each([
      [authoriser, "authoriser"],
      [administrator, "authoriser"],
    ])("Approve application claim processed", async (scope, role) => {
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
          confirm: ["approveClaim", "sentChecklist"],
          page: 1,
          returnPage: "claims",
          crumb,
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(`/view-claim/${reference}?page=1&returnPage=claims`);
    });

    test("Approve application claim not processed", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVwiIGRvZXMgbm90IGNvbnRhaW4gMSByZXF1aXJlZCB2YWx1ZShzKSIsImhyZWYiOiIjYXV0aG9yaXNlIiwia2V5IjoiY29uZmlybSJ9XQ%3D%3D";
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
        `/view-agreement/${reference}?page=1&approve=true&errors=${errors}`,
      );
    });

    test("If user is not administrator or authoriser", async () => {
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
          claimOrAgreement: "agreement",
          confirm: ["approveClaim", "sentChecklist"],
          reference,
          crumb,
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });
});
