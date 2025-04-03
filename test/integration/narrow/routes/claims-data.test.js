const getCrumbs = require("../../../utils/get-crumbs");
const { administrator } = require("../../../../app/auth/permissions");
const claimData = require("../../../data/claims.json");

jest.mock("../../../../app/session");
const claims = require("../../../../app/api/claims");
jest.mock("../../../../app/api/claims");
const applications = require("../../../../app/api/applications");
jest.mock("../../../../app/api/applications");
const pagination = require("../../../../app/pagination");
jest.mock("../../../../app/pagination");

jest.mock("../../../../app/routes/models/claim-list");

pagination.getPagination = jest.fn().mockReturnValue({
  limit: 10,
  offset: 0,
});

pagination.getPagingData = jest.fn().mockReturnValue({
  page: 1,
  totalPages: 1,
  total: 1,
  limit: 10,
});
claims.getClaims = jest.fn().mockReturnValue(claimData);

describe("Claims data tests", () => {
  jest.mock("../../../../app/auth");
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { name: "test user" } },
  };

  describe(`POST /claims/{reference}/data route`, () => {
    let crumb;
    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__);
      jest.clearAllMocks();
    });

    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });

    test("returns 302 after calling update claim data for vetsName", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "claim",
          form: "updateVetsName",
          vetsName: "Barry",
          note: "Updated value",
          panelID: "#update-vets-name",
          reference: "AAAA",
          returnPage: "claims",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);

      expect(res.headers.location).toBe(
        "/view-claim/AAAA?page=1&returnPage=claims",
      );
      expect(claims.updateClaimData).toHaveBeenCalledWith(
        "AAAA",
        { dateOfVisit: undefined, vetRCVSNumber: undefined, vetsName: "Barry" },
        "Updated value",
        "test user",
        expect.any(Object),
      );
    });

    test("returns 302 after calling update claim data for visitDate", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "claim",
          form: "updateDateOfVisit",
          day: 1,
          month: 2,
          year: 2028,
          note: "Updated value",
          panelID: "#update-date-of-visit",
          reference: "AAAA",
          returnPage: "claims",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);

      expect(res.headers.location).toBe(
        "/view-claim/AAAA?page=1&returnPage=claims",
      );
      expect(claims.updateClaimData).toHaveBeenCalledWith(
        "AAAA",
        {
          dateOfVisit: "2028-02-01T00:00:00.000Z",
          vetRCVSNumber: undefined,
          vetsName: undefined,
        },
        "Updated value",
        "test user",
        expect.any(Object),
      );
    });

    test("returns 302 after calling update claim data for rcvs number", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "claim",
          form: "updateVetRCVSNumber",
          vetRCVSNumber: "1234567",
          note: "Updated value",
          panelID: "#update-vet-rcvs-number",
          reference: "AAAA",
          returnPage: "claims",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);

      expect(res.headers.location).toBe(
        "/view-claim/AAAA?page=1&returnPage=claims",
      );
      expect(claims.updateClaimData).toHaveBeenCalledWith(
        "AAAA",
        {
          dateOfVisit: undefined,
          vetRCVSNumber: "1234567",
          vetsName: undefined,
        },
        "Updated value",
        "test user",
        expect.any(Object),
      );
    });

    test("returns 302 after calling update agreement data for vetsName", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "agreement",
          form: "updateVetsName",
          vetsName: "Barry",
          note: "Updated value",
          panelID: "#update-vets-name",
          reference: "AAAA",
          returnPage: "agreement",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);

      expect(res.headers.location).toBe("/view-agreement/AAAA?page=1");
      expect(applications.updateApplicationData).toHaveBeenCalledWith(
        "AAAA",
        { visitDate: undefined, vetRcvs: undefined, vetName: "Barry" },
        "Updated value",
        "test user",
        expect.any(Object),
      );
    });

    test("returns 302 after calling update agreement data for visitDate", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "agreement",
          form: "updateDateOfVisit",
          day: 1,
          month: 2,
          year: 2028,
          note: "Updated value",
          panelID: "#update-date-of-visit",
          reference: "AAAA",
          returnPage: "agreement",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);

      expect(res.headers.location).toBe("/view-agreement/AAAA?page=1");
      expect(applications.updateApplicationData).toHaveBeenCalledWith(
        "AAAA",
        {
          visitDate: "2028-02-01T00:00:00.000Z",
          vetRcvs: undefined,
          vetName: undefined,
        },
        "Updated value",
        "test user",
        expect.any(Object),
      );
    });

    test("returns 302 after calling update agreement data for rcvs number", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "agreement",
          form: "updateVetRCVSNumber",
          vetRCVSNumber: "1234567",
          note: "Updated value",
          panelID: "#update-vet-rcvs-number",
          reference: "AAAA",
          returnPage: "agreement",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);

      expect(res.headers.location).toBe("/view-agreement/AAAA?page=1");
      expect(applications.updateApplicationData).toHaveBeenCalledWith(
        "AAAA",
        { visitDate: undefined, vetRcvs: "1234567", vetName: undefined },
        "Updated value",
        "test user",
        expect.any(Object),
      );
    });

    test("returns 302 with an error message for an invalid rcvs", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "claim",
          form: "updateVetRCVSNumber",
          vetRCVSNumber: "12345",
          page: 1,
          note: "Updated value",
          panelID: "#update-vet-rcvs-number",
          reference: "AAAA",
          returnPage: "claims",
        },
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);

      expect(res.headers.location).toMatch(
        /view-claim\/AAAA\?page=1&updateVetRCVSNumber=true&errors=.+&returnPage=claims/,
      );
      expect(applications.updateApplicationData).toHaveBeenCalledTimes(0);
    });
  });
});
