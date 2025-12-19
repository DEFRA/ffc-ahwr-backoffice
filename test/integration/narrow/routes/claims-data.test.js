import { getCrumbs } from "../../../utils/get-crumbs";
import { permissions } from "../../../../app/auth/permissions";
import { claims } from "../../../data/claims";
import { getClaims, updateClaimData } from "../../../../app/api/claims";
import { updateApplicationData } from "../../../../app/api/applications";
import { getPagination, getPagingData } from "../../../../app/pagination";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";

const { administrator } = permissions;

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/routes/models/claim-list");
jest.mock("../../../../app/auth");

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
getClaims.mockReturnValue(claims);

describe("Claims data tests", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { name: "test user" } },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  describe(`POST /claims/{reference}/data route`, () => {
    let crumb;
    beforeEach(async () => {
      crumb = await getCrumbs(server);
      jest.clearAllMocks();
    });

    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
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
          reference: "AAAA",
          returnPage: "claims",
          dateOfVisit: "2025-01-22",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toBe("/view-claim/AAAA?page=1&returnPage=claims");
      expect(updateClaimData).toHaveBeenCalledWith(
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
          year: 2025,
          note: "Updated value",
          reference: "AAAA",
          returnPage: "claims",
          dateOfVisit: "2025-01-22",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toBe("/view-claim/AAAA?page=1&returnPage=claims");
      expect(updateClaimData).toHaveBeenCalledWith(
        "AAAA",
        {
          dateOfVisit: "2025-02-01T00:00:00.000Z",
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
          reference: "AAAA",
          returnPage: "claims",
          dateOfVisit: "2025-01-22",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toBe("/view-claim/AAAA?page=1&returnPage=claims");
      expect(updateClaimData).toHaveBeenCalledWith(
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
          reference: "AAAA",
          returnPage: "agreement",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toBe("/view-agreement/AAAA?page=1");
      expect(updateApplicationData).toHaveBeenCalledWith(
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
          reference: "AAAA",
          returnPage: "agreement",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toBe("/view-agreement/AAAA?page=1");
      expect(updateApplicationData).toHaveBeenCalledWith(
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
          reference: "AAAA",
          returnPage: "agreement",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toBe("/view-agreement/AAAA?page=1");
      expect(updateApplicationData).toHaveBeenCalledWith(
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
          reference: "AAAA",
          returnPage: "claims",
          dateOfVisit: "2025-01-22",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toMatch(
        /view-claim\/AAAA\?page=1&updateVetRCVSNumber=true&errors=.+&returnPage=claims/,
      );
      expect(updateApplicationData).toHaveBeenCalledTimes(0);
    });

    test("returns 302 with an error message when visitDate moved after payment rate change", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "claim",
          form: "updateDateOfVisit",
          day: 22,
          month: 1,
          year: 2026,
          note: "Updated value",
          reference: "AAAA",
          returnPage: "claims",
          dateOfVisit: "2025-11-22",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toMatch(
        /view-claim\/AAAA\?page=1&updateDateOfVisit=true&errors=.+&returnPage=claims/,
      );
      expect(updateApplicationData).toHaveBeenCalledTimes(0);
    });

    test("returns 302 with an error message when visitDate moved before payment rate change", async () => {
      const options = {
        method: "POST",
        url: "/claims/data",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          claimOrAgreement: "claim",
          form: "updateDateOfVisit",
          day: 22,
          month: 11,
          year: 2025,
          note: "Updated value",
          reference: "AAAA",
          returnPage: "claims",
          dateOfVisit: "2026-01-22",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      expect(res.headers.location).toMatch(
        /view-claim\/AAAA\?page=1&updateDateOfVisit=true&errors=.+&returnPage=claims/,
      );
      expect(updateApplicationData).toHaveBeenCalledTimes(0);
    });
  });
});
