import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { permissions } from "../../../../app/auth/permissions";
import { applicationsData } from "../../../data/applications.js";
import { getApplication } from "../../../../app/api/applications";
import { getClaims } from "../../../../app/api/claims";
import { claims } from "../../../data/claims";
import { displayContactHistory, getContactHistory } from "../../../../app/api/contact-history";
import { contactHistory } from "../../../data/contact-history";
import { getPagination, getPagingData } from "../../../../app/pagination";
import { getClaimSearch } from "../../../../app/session";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";
import { getClaimViewStates } from "../../../../app/routes/utils/get-claim-view-states";

const { administrator } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/contact-history.js");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/api/claims.js");
jest.mock("../../../../app/api/contact-history.js");
jest.mock("../../../../app/auth");
jest.mock("../../../../app/session");
jest.mock("../../../../app/routes/utils/get-claim-view-states");

getApplication.mockReturnValue(applicationsData.applications[0]);
getContactHistory.mockReturnValue(contactHistory);
getPagination.mockReturnValue({
  limit: 10,
  offset: 0,
});

getPagingData.mockReturnValue({
  page: 1,
  totalPages: 1,
  total: 1,
  limit: 10,
});

getClaims.mockReturnValue({ total: 9, claims });

displayContactHistory.mockReturnValue({
  orgEmail: "Na",
  email: "test12@testvest.com",
  farmerName: "NA",
  address: "NA",
});

getClaimViewStates.mockReturnValue({
  updateEligiblePiiRedactionAction: false,
  updateEligiblePiiRedactionForm: false,
});

const auth = {
  strategy: "session-auth",
  credentials: { scope: [administrator], account: "test user" },
};

describe("Claims test", () => {
  const url = "/agreement/123/claims";

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  describe(`GET ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "GET",
        url,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 400 if application is undefined", async () => {
      getApplication.mockReturnValueOnce(undefined);
      const options = {
        method: "GET",
        url,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(400);
    });

    test("returns 200", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($("th[aria-sort]")[0].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[0].attribs["data-url"]).toContain("claim number");
      expect($("th[aria-sort]")[1].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[1].attribs["data-url"]).toContain("claims/sort/species");
      expect($("th[aria-sort]")[2].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[2].attribs["data-url"]).toContain("claims/sort/claim date");
      expect($("th[aria-sort]")[3].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[3].attribs["data-url"]).toContain("claims/sort/status");

      const actions = $(".govuk-summary-list__actions");
      expect(actions.find("a.govuk-link").length).toBe(1);
      expect(actions.find("a.govuk-link").text()).toBe("Change");
      expect(actions.find("a.govuk-link").attr("href")).toContain(
        "/agreement/123/claims?page=1&updateEligiblePiiRedaction=true",
      );

      const redactionRow = $(".govuk-summary-list__row")
        .filter(
          (i, el) => $(el).find("dt").text().trim() === "Eligible for automated data redaction",
        )
        .first();
      expect(redactionRow.find(".govuk-summary-list__value p").text().trim()).toBe("No");
    });

    test("returns 200 and hides actions when agreement is redacted", async () => {
      getApplication.mockReturnValue({
        ...applicationsData.applications[0],
        applicationRedacts: [
          {
            success: "Y",
          },
        ],
      });
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);

      const actions = $(".govuk-summary-list__actions");
      expect(actions.find("a.govuk-link").length).toBe(0);
    });

    test("displays eligible for automated data redaction as Yes when the value is true", async () => {
      getApplication.mockReturnValue({
        ...applicationsData.applications[0],
        eligiblePiiRedaction: true,
      });
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      const redactionRow = $(".govuk-summary-list__row")
        .filter(
          (i, el) => $(el).find("dt").text().trim() === "Eligible for automated data redaction",
        )
        .first();
      expect(redactionRow.find(".govuk-summary-list__value p").text().trim()).toBe("Yes");
    });

    test("returns table in correct sort order", async () => {
      getClaimSearch.mockReturnValueOnce({
        field: "claim number",
        direction: "ASC",
      });

      const options = {
        method: "GET",
        url,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($("th[aria-sort]")[0].attribs["aria-sort"]).toEqual("ascending");
      expect($("th[aria-sort]")[0].attribs["data-url"]).toContain("claim number");
      expect($("th[aria-sort]")[1].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[1].attribs["data-url"]).toContain("claims/sort/species");
      expect($("th[aria-sort]")[2].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[2].attribs["data-url"]).toContain("claims/sort/claim date");
      expect($("th[aria-sort]")[3].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[3].attribs["data-url"]).toContain("claims/sort/status");
    });

    test.each([
      { field: "claim number", direction: "ASC" },
      { field: "type of visit", direction: "ASC" },
      { field: "species", direction: "ASC" },
      { field: "claim date", direction: "ASC" },
      { field: "status", direction: "ASC" },
      { field: "claim number", direction: "DESC" },
      { field: "type of visit", direction: "DESC" },
      { field: "species", direction: "DESC" },
      { field: "claim date", direction: "DESC" },
      { field: "status", direction: "DESC" },
    ])(
      "returns table in correct $direction sort order on field $field",
      async ({ field, direction }) => {
        getClaimSearch.mockReturnValueOnce({ field, direction });

        const options = {
          method: "GET",
          url,
          auth,
        };

        const res = await server.inject(options);
        expect(res.statusCode).toBe(StatusCodes.OK);
        const $ = cheerio.load(res.payload);
        expect($("title").text()).toContain("Administration - My Farm");
        phaseBannerOk($);
      },
    );

    test("returns 200 sort endpoint", async () => {
      const options = {
        method: "GET",
        url: "/agreement/123/claims/sort/claim number/DESC",
        auth,
      };

      const res = await server.inject(options);
      expect(res.result).toEqual(1);
    });

    test("the back link should go to view claim if the user is coming from view claim page", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1&returnPage=view-claim&reference=REDC-6179-D9D3`,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($(".govuk-back-link").attr("href")).toEqual("/view-claim/REDC-6179-D9D3?page=1");
    });

    test("the back link should go to all agreements if the user is coming from all agreements main tab", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($(".govuk-back-link").attr("href")).toEqual("/agreements?page=1");
    });
  });
});
