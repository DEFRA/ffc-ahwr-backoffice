const cheerio = require("cheerio");
const expectPhaseBanner = require("../../../utils/phase-banner-expect");
const applications = require("../../../../app/api/applications");
const { administrator } = require("../../../../app/auth/permissions");
const viewApplicationData = require(".././../../data/view-applications.json");
const applicationHistoryData = require("../../../data/application-history.json");
const { resetAllWhenMocks } = require("jest-when");
const reference = "AHWR-555A-FD4C";
let getClaimViewStates;

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

jest.mock("../../../../app/api/applications");

describe("View Application test with Date of Testing enabled", () => {
  const url = `/view-agreement/${reference}`;
  jest.mock("../../../../app/auth");
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "" } },
  };

  jest.mock("@hapi/wreck", () => ({
    get: jest.fn().mockResolvedValue({ payload: [] }),
  }));

  beforeAll(() => {
    jest.clearAllMocks();
    jest.mock("../../../../app/routes/utils/get-claim-view-states");
    getClaimViewStates = require("../../../../app/routes/utils/get-claim-view-states");

    getClaimViewStates.getClaimViewStates.mockReturnValue({
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
  });

  afterEach(() => {
    resetAllWhenMocks();
  });

  describe(`GET ${url} route`, () => {
    test("returns 200 application claim - claim date in application data", async () => {
      const status = "Claimed";
      applications.getApplication.mockReturnValueOnce(viewApplicationData.claim);
      applications.getApplicationHistory.mockReturnValueOnce({
        historyRecords: applicationHistoryData,
      });

      const options = {
        method: "GET",
        url,
        auth,
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(200);
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
        "Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC",
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

      expectPhaseBanner.ok($);
    });
  });
});
