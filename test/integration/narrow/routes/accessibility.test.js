import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";

describe("Accessibility Statement", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test("should load page successfully", async () => {
    const options = {
      method: "GET",
      url: "/accessibility",
    };
    const response = await server.inject(options);
    expect(response.statusCode).toBe(StatusCodes.OK);
    const $ = cheerio.load(response.payload);
    expect($("h1.govuk-heading-l").text()).toEqual(
      "Accessibility statement for Administration of the health and welfare of your livestock service",
    );
    phaseBannerOk($);
  });
});
