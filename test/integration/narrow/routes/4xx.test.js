import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { createServer } from "../../../../app/server";
import * as cheerio from "cheerio";

describe("4xx error pages", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test("GET /unknown route returns 404", async () => {
    const options = {
      method: "GET",
      url: "/unknown",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(404);
    const $ = cheerio.load(res.payload);
    expect($(".govuk-heading-l").text()).toEqual("404 - Not Found");
    expect($("#_404 div p").text()).toEqual("Not Found");
    phaseBannerOk($);
  });
});
