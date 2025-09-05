import { getCrumbs } from "../../../utils/get-crumbs";
import { permissions } from "../../../../app/auth/permissions";
import { getClaims } from "../../../../app/api/claims";
import { getPagination, getPagingData } from "../../../../app/pagination";
import { createServer } from "../../../../app/server";
import { claims } from "../../../data/claims.js";
import { StatusCodes } from "http-status-codes";
import { updateEligiblePiiRedaction } from "../../../../app/api/applications";

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/routes/models/claim-list");
jest.mock("../../../../app/auth");
jest.mock("../../../../app/api/applications");

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

const { administrator } = permissions;

describe("get-applications-to-redact", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  describe("POST /agreements/{ref}/eligible-pii-redaction", () => {
    let crumb;
    const url = "/agreements/IAHW-U6ZE-5R5E/eligible-pii-redaction";

    beforeEach(async () => {
      crumb = await getCrumbs(server);
      jest.clearAllMocks();
    });

    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("updates eligible pii redaction and redirects to new world agreement when new world reference", async () => {
      updateEligiblePiiRedaction.mockResolvedValueOnce();
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          note: "Investigating issue",
          reference: "IAHW-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toBe("/agreement/IAHW-U6ZE-5R5E/claims?page=1");
    });

    test("updates eligible pii redaction and redirects to old world agreement when old world reference", async () => {
      updateEligiblePiiRedaction.mockResolvedValueOnce();
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          note: "Investigating issue",
          reference: "AHWR-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toBe("/view-agreement/AHWR-U6ZE-5R5E?page=1");
    });

    test("redirects to new world agreement with errors when new world reference", async () => {
      updateEligiblePiiRedaction.mockResolvedValueOnce();
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          reference: "IAHW-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        expect.stringContaining(
          "/agreement/IAHW-U6ZE-5R5E/claims?page=1&updateEligiblePiiRedaction=true&errors=",
        ),
      );
    });

    test("redirects to old world agreement with errors when old world reference", async () => {
      updateEligiblePiiRedaction.mockResolvedValueOnce();
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          reference: "AHWR-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toEqual(
        expect.stringContaining(
          "/view-agreement/AHWR-U6ZE-5R5E?page=1&updateEligiblePiiRedaction=true&errors=",
        ),
      );
    });
  });
});
