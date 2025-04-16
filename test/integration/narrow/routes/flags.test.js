const cheerio = require("cheerio");
const expectPhaseBanner = require("../../../utils/phase-banner-expect");
const getCrumbs = require("../../../utils/get-crumbs");
const { administrator } = require("../../../../app/auth/permissions");
const flags = require("../../../../app/api/flags");
const mockFlags = require("../../../data/flags.json");

jest.mock("../../../../app/api/flags");

flags.getAllFlags.mockResolvedValue(mockFlags);
flags.deleteFlag.mockResolvedValueOnce(null);
flags.createFlag.mockResolvedValue({ res: { statusCode: 201 } });

describe("Flags tests", () => {
  jest.mock("../../../../app/auth");
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { name: "test user" } },
  };

  let crumb;

  describe("GET /flags route", () => {
    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__);
    });

    test("returns 302 when there is no auth", async () => {
      const options = {
        method: "GET",
        url: "/flags",
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });

    test("returns 200", async () => {
      const options = {
        method: "GET",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expectPhaseBanner.ok($);
    });
  });

  describe(`POST /flags/{flagId}/delete route`, () => {
    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__);
    });

    test("returns 302 when there is no auth", async () => {
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });

    test("returns the user to the flags page when the flag has happily been deleted", async () => {
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expectPhaseBanner.ok($);
    });
  });

  describe(`POST /flags/create route`, () => {
    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__);
    });

    test("returns 302 when there is no auth", async () => {
      const options = {
        method: "POST",
        url: "/flags/create",
      };
      const res = await global.__SERVER__.inject(options);
      expect(res.statusCode).toBe(302);
    });

    test("returns the user to the flags page when the flag has been created", async () => {
      const options = {
        method: "POST",
        url: "/flags/create",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "Test flag",
          appliesToMh: "yes",
        },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expectPhaseBanner.ok($);
    });

    test("renders errors when the user has not provided the proper payload", async () => {
      const options = {
        method: "POST",
        url: "/flags/create",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "Test flag",
          appliesToMh: "something",
        },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(302);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation
        .split("errors=")[1]
        .replace("%3D", "");
      const parsedErrors = JSON.parse(
        Buffer.from(base64EncodedErrors, "base64").toString("utf8"),
      );
      expect(parsedErrors).toEqual([
        {
          href: "#",
          key: "appliesToMh",
          text: "Select if the flag is because the user declined Multiple Herds T&C's.",
        },
      ]);
    });
  });
});
