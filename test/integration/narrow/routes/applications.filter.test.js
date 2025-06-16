import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { permissions } from "../../../../app/auth/permissions";
import { getPagination, getPagingData } from "../../../../app/pagination";
import { getApplications } from "../../../../app/api/applications";
import { getAppSearch, setAppSearch } from "../../../../app/session";
import { applicationsData } from "../../../data/applications.js";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";

const { administrator } = permissions;

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/pagination");
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

getApplications.mockReturnValue(applicationsData);

getAppSearch
  .mockReturnValue([])
  .mockReturnValueOnce(["PENDING", "APPLIED", "DATA INPUTTED", "CLAIMED"])
  .mockReturnValueOnce({ field: "SBI", direction: "DESC" });

describe("Applications Filter test", () => {
  const url = "/agreements/remove";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };
  const method = "GET";

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET ${url} route remove`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method,
        url: `${url}/PENDING`,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });
    test("returns 200", async () => {
      const options = {
        method,
        url: `${url}/PENDING`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Agreements");
      expect($("title").text()).toContain("AHWR Agreements");
      expect(getAppSearch).toHaveBeenCalledTimes(6);
      expect(setAppSearch).toHaveBeenCalledTimes(1);
      phaseBannerOk($);
    });

    test("returns 200 with selected status", async () => {
      const options = {
        method,
        url: `${url}/PENDING`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("govuk-checkboxes__input").filter((s) => s.value === "APPLIED")).toBeTruthy();
      expect(getAppSearch).toHaveBeenCalledTimes(6);
      expect(setAppSearch).toHaveBeenCalledTimes(1);
      phaseBannerOk($);
    });
  });

  describe("GET /agreements/clear route", () => {
    test("returns 302 no auth", async () => {
      const options = {
        method,
        url: "/agreements/clear",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });
    test("returns 200", async () => {
      const options = {
        method,
        url: "/agreements/clear",
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Agreements");
      expect($("title").text()).toContain("AHWR Agreements");
      expect(getAppSearch).toHaveBeenCalledTimes(5);
      expect(setAppSearch).toHaveBeenCalledTimes(1);
      phaseBannerOk($);
    });
  });

  describe("GET /agreements/sort route", () => {
    test("returns 302 no auth", async () => {
      const options = {
        method,
        url: "/agreements/sort/sbi/ascending",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200 ascending", async () => {
      const options = {
        method,
        url: "/agreements/sort/sbi/ascending",
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.payload).toEqual("1");
      expect(getAppSearch).toHaveBeenCalledTimes(0);
      expect(setAppSearch).toHaveBeenCalledTimes(1);
    });

    test("returns 200 descending", async () => {
      const options = {
        method,
        url: "/agreements/sort/sbi/descending",
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.payload).toEqual("1");
      expect(getAppSearch).toHaveBeenCalledTimes(0);
      expect(setAppSearch).toHaveBeenCalledTimes(1);
    });
  });
});
