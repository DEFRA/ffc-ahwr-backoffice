import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getAllFlags, createFlag, deleteFlag } from "../../../../app/api/flags";
import { flags } from "../../../data/flags.js";
import { StatusCodes } from "http-status-codes";
import { mapAuth } from "../../../../app/auth/map-auth.js";
import { createServer } from "../../../../app/server.js";

const { administrator, user } = permissions;

jest.mock("../../../../app/api/flags");
jest.mock("../../../../app/auth/map-auth");
jest.mock("../../../../app/auth");

mapAuth.mockResolvedValue({ isAdministrator: true });
getAllFlags.mockResolvedValue(flags);

describe("Flags tests", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { name: "test admin" } },
  };

  let crumb;
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  describe("GET /flags route", () => {
    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 when there is no auth", async () => {
      const options = {
        method: "GET",
        url: "/flags",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200", async () => {
      const options = {
        method: "GET",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      phaseBannerOk($);
    });

    test("returns 200 when user is not an admin", async () => {
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [user], account: { name: "test user" } },
      };

      const options = {
        method: "GET",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      phaseBannerOk($);
    });
  });

  describe(`POST /flags/{flagId}/delete route`, () => {
    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 when there is no auth", async () => {
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns a 400 if the delete API call fails and redirects user back to flags page", async () => {
      deleteFlag.mockImplementationOnce(() => {
        throw new Error("deletion failed");
      });
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, deletedNote: "Flag deleted" },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      phaseBannerOk($);
    });

    test("redirects the user to the flags page when the flag has happily been deleted", async () => {
      deleteFlag.mockResolvedValueOnce(null);
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, deletedNote: "Flag deleted" },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toBe("/flags");
    });

    test("renders errors when the user has not provided a deleted note value", async () => {
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain(`flags?deleteFlag=${flagId}&errors=`);

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
      expect(parsedErrors).toEqual([
        {
          href: "#deletedNote",
          key: "deletedNote",
          text: "Enter a note to explain the reason for removing this flag",
        },
      ]);
    });

    test("renders errors when the user has not provided a long enough deleted note value", async () => {
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags/${flagId}/delete`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          deletedNote: "a",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain(`flags?deleteFlag=${flagId}&errors=`);

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
      expect(parsedErrors).toEqual([
        {
          href: "#deletedNote",
          key: "deletedNote",
          text: "Enter a note of at least 2 characters in length",
        },
      ]);
    });
  });

  describe(`POST /flags/create route`, () => {
    beforeEach(async () => {
      crumb = await getCrumbs(server);
      jest.clearAllMocks();
    });

    test("returns 302 when there is no auth", async () => {
      const options = {
        method: "POST",
        url: "/flags/create",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 400 when the create flag API call fails", async () => {
      createFlag.mockImplementationOnce(() => {
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
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    test("returns the user to the flags page when the flag has been created", async () => {
      createFlag.mockResolvedValueOnce({ res: { statusCode: 201 } });
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
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(createFlag).toHaveBeenCalledWith(
        { appliesToMh: true, note: "Test flag", user: "test admin" },
        "IAHW-TEST-REF1",
        expect.any(Object),
      );
      expect(res.headers.location).toBe("/flags");
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
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
      expect(parsedErrors).toEqual([
        {
          href: "#",
          key: "appliesToMh",
          text: "Select if the flag is because the user declined multiple herds T&C's.",
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
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
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
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
      expect(parsedErrors).toEqual([
        {
          href: "#",
          key: "note",
          text: "Enter a note to explain the reason for creating the flag.",
        },
      ]);
    });

    test("renders an error when the user is trying to create a flag which already exists", async () => {
      createFlag.mockImplementationOnce(() => {
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
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
      expect(parsedErrors).toEqual([
        {
          href: "#agreement-reference",
          key: "appRef",
          text: 'Flag not created - agreement flag with the same "Flag applies to multiple herds T&C\'s" value already exists.',
        },
      ]);
    });

    test("renders an error when the user is trying to create a flag with a reference that doesnt exist", async () => {
      createFlag.mockImplementationOnce(() => {
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
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
      expect(parsedErrors).toEqual([
        {
          href: "#agreement-reference",
          key: "appRef",
          text: "Agreement reference does not exist.",
        },
      ]);
    });

    test("renders an error when the user is trying to create a flag for an agreement that is redacted", async () => {
      createFlag.mockImplementationOnce(() => {
        const error = {
          data: {
            payload: {
              message: "Unable to create flag for redacted agreement",
            },
            res: {
              statusCode: 400,
            },
          },
          isBoom: true,
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
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);

      const redirectedLocation = res.headers.location;
      expect(redirectedLocation).toContain("flags?createFlag=true&errors=");

      const base64EncodedErrors = redirectedLocation.split("errors=")[1].replace("%3D%3D", "");
      const parsedErrors = JSON.parse(Buffer.from(base64EncodedErrors, "base64").toString("utf8"));
      expect(parsedErrors).toEqual([
        {
          href: "#agreement-reference",
          key: "appRef",
          text: "Flag not created - agreement is redacted.",
        },
      ]);
    });
  });
});
