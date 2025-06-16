import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { permissions } from "../../../../app/auth/permissions";
import { getCrumbs } from "../../../utils/get-crumbs";
import { updateApplicationStatus } from "../../../../app/api/applications";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";
import { preSubmissionHandler } from "../../../../app/routes/utils/pre-submission-handler";
import boom from "@hapi/boom";

const { administrator, processor, user, recommender, authoriser } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/auth");
jest.mock("../../../../app/routes/utils/pre-submission-handler");

preSubmissionHandler.mockImplementation((_arg, h) => h.continue);

const reference = "AHWR-555A-FD4C";

describe("Withdraw Application tests", () => {
  let crumb;
  const url = "/withdraw-agreement";

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

    test("returns 403 when scope is not administrator, recommender or authoriser", async () => {
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("403 - Forbidden");
      phaseBannerOk($);
    });

    test("returns 403", async () => {
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
      const auth = {
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

      const res1 = await server.inject(options);
      expect(res1.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const res2 = await server.inject(options);
      expect(res2.statusCode).toBe(StatusCodes.FORBIDDEN);
      const $ = cheerio.load(res2.payload);
      phaseBannerOk($);
      expect($(".govuk-heading-l").text()).toEqual("403 - Forbidden");

      preSubmissionHandler.mockImplementation((_arg, h) => h.continue);
    });

    test("Approve withdraw application", async () => {
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(updateApplicationStatus).toHaveBeenCalledTimes(1);
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`);
    });

    test("Return error, when any of the check boxes are not checked", async () => {
      const errors =
        "W3sidGV4dCI6IlwiY29uZmlybVwiIGRvZXMgbm90IGNvbnRhaW4gMSByZXF1aXJlZCB2YWx1ZShzKSIsImhyZWYiOiIjd2l0aGRyYXciLCJrZXkiOiJjb25maXJtIn1d";
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
      const res = await server.inject(options);

      expect(res.headers.location).toEqual(
        `/view-agreement/${reference}?page=1&withdraw=true&errors=${errors}`,
      );
    });
  });
});
