import { getCrumbs } from "../../../utils/get-crumbs";
import { permissions } from "../../../../app/auth/permissions";
import { getClaims } from "../../../../app/api/claims";
import { getPagination, getPagingData } from "../../../../app/pagination";
import { createServer } from "../../../../app/server";
import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { claims } from "../../../data/claims.js";
import { getClaimSearch, setClaimSearch } from "../../../../app/session";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
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

const { administrator } = permissions;

describe("Claims tests", () => {
  const url = "/claims";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };

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

    test("returns 200", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Claims");
      expect($("title").text()).toContain("AHWR Claims");
      expect(getClaimSearch).toHaveBeenCalledTimes(2);
      phaseBannerOk($);
    });

    test("returns 200 with query parameter", async () => {
      const options = {
        method: "GET",
        url: `${url}/sort/claim number/descending`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe(`POST ${url} route`, () => {
    let crumb;

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

    test("returns 200", async () => {
      const options = {
        method: "POST",
        payload: { crumb, searchText: "test" },
        headers: { cookie: `crumb=${crumb}` },
        url,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledTimes(1);
    });
  });
});
