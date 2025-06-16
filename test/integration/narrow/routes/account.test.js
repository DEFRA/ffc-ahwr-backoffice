import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { upperFirstLetter } from "../../../../app/lib/display-helper";
import { permissions } from "../../../../app/auth/permissions";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/auth");

const { administrator, processor, user, recommender, authoriser } = permissions;

describe("Account page test", () => {
  const url = "/account";
  let auth = {
    strategy: "session-auth",
    credentials: { scope: ["administrator"], account: {} },
  };

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();
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
    test.each([
      ["Test user 1", "user1@test", [administrator]],
      ["Test user 2", "user2@test", [processor]],
      ["Test user 3", "user3@test", [user]],
      ["Test user 4", "user4@test", [recommender]],
      ["Test user 5", "user5@test", [authoriser]],
      ["Test user 6", "user6@test", [administrator, processor, user, recommender, authoriser]],
    ])("returns 200, page loads successfully", async (name, username, roles) => {
      auth = {
        strategy: "session-auth",
        credentials: { scope: roles, account: { name, username } },
      };
      const options = {
        method: "GET",
        url,
        auth,
      };
      const response = await server.inject(options);
      expect(response.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(response.payload);
      expect($(".govuk-summary-list__row").length).toEqual(3);
      expect($(".govuk-summary-list__key").eq(0).text()).toMatch("User");
      expect($(".govuk-summary-list__value").eq(0).text()).toMatch(user);
      expect($(".govuk-summary-list__key").eq(1).text()).toMatch("Username");
      expect($(".govuk-summary-list__value").eq(1).text()).toMatch(username);
      expect($(".govuk-summary-list__key").eq(2).text()).toMatch("Role");
      expect($(".govuk-summary-list__value").eq(2).text()).toMatch(
        roles.map((x) => upperFirstLetter(x)).join(", "),
      );

      phaseBannerOk($);
    });
  });
});
