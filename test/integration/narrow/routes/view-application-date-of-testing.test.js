import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { getApplication, getApplicationHistory } from "../../../../app/api/applications";
import { permissions } from "../../../../app/auth/permissions";
import { viewApplicationData } from "../../../data/view-applications.js";
import { applicationHistory } from "../../../data/application-history.js";
import { resetAllWhenMocks } from "jest-when";
import { createServer } from "../../../../app/server";
import { getClaimViewStates } from "../../../../app/routes/utils/get-claim-view-states";
import { StatusCodes } from "http-status-codes";

const { administrator } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("@hapi/wreck", () => ({
  get: jest.fn().mockResolvedValue({ payload: [] }),
}));
jest.mock("../../../../app/auth");

function expectWithdrawLink($, reference, isWithdrawLinkVisible) {
  if (isWithdrawLinkVisible) {
    expect($(".govuk-link").hasClass);
    const withdrawLink = $(".govuk-link");
    expect(withdrawLink.text()).toMatch("Withdraw");
    expect(withdrawLink.attr("href")).toMatch(`/view-agreement/${reference}?page=1&withdraw=true`);
  } else {
    expect($(".govuk-link").not.hasClass);
  }
}

describe("View Application test with Date of Testing enabled", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "" } },
  };

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();

    getClaimViewStates.mockReturnValue({
      withdrawAction: false,
      withdrawForm: false,
      moveToInCheckAction: false,
      moveToInCheckForm: false,
      recommendAction: false,
      recommendToPayForm: false,
      recommendToRejectForm: false,
      authoriseAction: false,
      authoriseForm: false,
      rejectAction: false,
      rejectForm: false,
      updateStatusForm: false,
    });

    server = await createServer();
  });

  afterEach(() => {
    resetAllWhenMocks();
  });

  describe("GET /view-agreement/<reference> route", () => {
    test("returns 200 application claim - claim date in application data", async () => {
      const reference = "AHWR-555A-FD4C";
      const status = "Claimed";
      getApplication.mockReturnValueOnce(viewApplicationData.claim);
      getApplicationHistory.mockReturnValueOnce({
        historyRecords: applicationHistory,
      });

      const options = {
        method: "GET",
        url: `/view-agreement/${reference}`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-caption-l").text()).toContain(`Agreement number: ${reference}`);
      expect($("h2.govuk-heading-l").text()).toContain(status);
      expect($("title").text()).toContain("Administration: User Agreement");
      expect($("#organisation-details .govuk-summary-list__row").length).toEqual(5);
      expect($(".govuk-summary-list__key").eq(0).text()).toMatch("Agreement holder");
      expect($(".govuk-summary-list__value").eq(0).text()).toMatch("Farmer name");

      expect($(".govuk-summary-list__key").eq(1).text()).toMatch("SBI number");
      expect($(".govuk-summary-list__value").eq(1).text()).toMatch("333333333");

      expect($(".govuk-summary-list__key").eq(2).text()).toMatch("Address");
      expect($(".govuk-summary-list__value").eq(2).text()).toMatch(
        "Long dusty road, Middle-of-nowhere, In the countryside, CC33 3CC",
      );

      expect($(".govuk-summary-list__key").eq(3).text()).toMatch("Email address");
      expect($(".govuk-summary-list__value").eq(3).text()).toMatch("test@test.com");

      expect($(".govuk-summary-list__key").eq(4).text()).toMatch("Organisation email address");
      expect($(".govuk-summary-list__value").eq(4).text()).toMatch("test@test.com");

      expect($("#application").text()).toContain(status);
      expect($("#claim").text()).toContain(status);

      expect($("#claim .govuk-summary-list__key").eq(1).text()).toContain("Date of review");
      expect($("#claim .govuk-summary-list__value").eq(1).text()).toContain("07/11/2022");
      expect($("#claim .govuk-summary-list__key").eq(2).text()).toContain("Date of testing");
      expect($("#claim .govuk-summary-list__value").eq(2).text()).toContain("08/11/2022");
      expect($("#claim .govuk-summary-list__key").eq(3).text()).toContain("Date of claim");
      expect($("#claim .govuk-summary-list__value").eq(3).text()).toContain("09/11/2022");
      expect($("#claim .govuk-summary-list__key").eq(4).text()).toContain(
        "Review details confirmed",
      );
      expect($("#claim .govuk-summary-list__value").eq(4).text()).toContain("Yes");
      expect($("#claim .govuk-summary-list__key").eq(5).text()).toContain("Vet’s name");
      expect($("#claim .govuk-summary-list__value").eq(5).text()).toContain("testVet");
      expect($("#claim .govuk-summary-list__key").eq(6).text()).toContain("Vet’s RCVS number");
      expect($("#claim .govuk-summary-list__value").eq(6).text()).toContain("1234234");
      expect($("#claim .govuk-summary-list__key").eq(7).text()).toContain(
        "Test results unique reference number (URN)",
      );
      expect($("#claim .govuk-summary-list__value").eq(7).text()).toContain("134242");

      expectWithdrawLink($, reference, false);

      phaseBannerOk($);
    });
  });
});
