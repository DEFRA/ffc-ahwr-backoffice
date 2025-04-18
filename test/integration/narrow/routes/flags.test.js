const cheerio = require("cheerio");
const expectPhaseBanner = require("../../../utils/phase-banner-expect");
const getCrumbs = require("../../../utils/get-crumbs");
const { administrator } = require("../../../../app/auth/permissions");
const flags = require("../../../../app/api/flags");
const mockFlags = require("../../../data/flags.json");

jest.mock("../../../../app/api/flags");

flags.getAllFlags.mockResolvedValue(mockFlags);

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

    test("returns a 400 if the delete API call fails and redirects user back to flags page", async () => {
      flags.deleteFlag.mockImplementationOnce(() => {
        throw new Error("deletion failed");
      });
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(400);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expectPhaseBanner.ok($);
    });

    test("returns the user to the flags page when the flag has happily been deleted", async () => {
      flags.deleteFlag.mockResolvedValueOnce(null);
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

    test("returns 400 when the create flag API call fails", async () => {
      flags.createFlag.mockImplementationOnce(() => {
        let error = new Error("Random error");
        error = {
          data: {
            res: {
              statusCode: 500,
            },
          },
          message: error.message,
        };
        throw error;
      });
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
      expect(res.statusCode).toBe(400);
    });

    test("returns the user to the flags page when the flag has been created", async () => {
      flags.createFlag.mockResolvedValueOnce({ res: { statusCode: 201 } });
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

    test("renders errors when the user has not provided the proper appliesToMh value", async () => {
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

    test("renders errors when the user has not provided the proper appRef value", async () => {
      const options = {
        method: "POST",
        url: "/flags/create",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-RE",
          note: "Test flag",
          appliesToMh: "yes",
        },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(302);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation
        .split("errors=")[1]
        .replace("%3D%3D", "");
      const parsedErrors = JSON.parse(
        Buffer.from(base64EncodedErrors, "base64").toString("utf8"),
      );
      expect(parsedErrors).toEqual([
        {
          href: "#",
          key: "appRef",
          text: "Enter a valid agreement reference.",
        },
      ]);
    });

    test("renders errors when the user has not provided the proper note value", async () => {
      const options = {
        method: "POST",
        url: "/flags/create",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "",
          appliesToMh: "yes",
        },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(302);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation
        .split("errors=")[1]
        .replace("%3D%3D", "");
      const parsedErrors = JSON.parse(
        Buffer.from(base64EncodedErrors, "base64").toString("utf8"),
      );
      expect(parsedErrors).toEqual([
        {
          href: "#",
          key: "note",
          text: "Enter a note to explain the reason for creating the flag.",
        },
      ]);
    });

    test("renders an error when the user is trying to create a flag which already exists", async () => {
      flags.createFlag.mockImplementationOnce(() => {
        let error = new Error("Flag already exists");
        error = {
          data: {
            res: {
              statusCode: 204,
            },
          },
          message: error.message,
        };
        throw error;
      });
      const options = {
        method: "POST",
        url: "/flags/create",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "To be flagged",
          appliesToMh: "yes",
        },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(302);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation
        .split("errors=")[1]
        .replace("%3D%3D", "");
      const parsedErrors = JSON.parse(
        Buffer.from(base64EncodedErrors, "base64").toString("utf8"),
      );
      expect(parsedErrors).toEqual([
        {
          href: "#agreement-reference",
          key: "appRef",
          text: 'Flag not created - agreement flag with the same "Flag applies to MH T&C\'s" value already exists.',
        },
      ]);
    });

    test("renders an error when the user is trying to create a flag with a reference that doesnt exist", async () => {
      flags.createFlag.mockImplementationOnce(() => {
        let error = new Error("Flag does not exist");
        error = {
          data: {
            res: {
              statusCode: 404,
            },
          },
          message: error.message,
        };
        throw error;
      });
      const options = {
        method: "POST",
        url: "/flags/create",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "To be flagged",
          appliesToMh: "yes",
        },
      };
      const res = await global.__SERVER__.inject(options);

      expect(res.statusCode).toBe(302);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation
        .split("errors=")[1]
        .replace("%3D%3D", "");
      const parsedErrors = JSON.parse(
        Buffer.from(base64EncodedErrors, "base64").toString("utf8"),
      );
      expect(parsedErrors).toEqual([
        {
          href: "#agreement-reference",
          key: "appRef",
          text: "Agreement reference does not exist.",
        },
      ]);
    });
  });
});
