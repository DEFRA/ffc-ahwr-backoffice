import { createServer } from "../../../app/server";

describe("headers plugin tests", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test.each([
    { key: "X-Frame-Options", value: "deny" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
    { key: "X-XSS-Protection", value: "1; mode=block" },
    { key: "Strict-Transport-Security", value: "max-age=31536000;" },
    { key: "Cache-Control", value: "no-cache" },
    { key: "Referrer-Policy", value: "no-referrer" },
    {
      key: "Content-Security-Policy",
      value:
        "default-src 'self';object-src 'none';script-src 'self' www.google-analytics.com *.googletagmanager.com ajax.googleapis.com *.googletagmanager.com/gtm.js 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes';form-action 'self';base-uri 'self';connect-src 'self' *.google-analytics.com *.analytics.google.com *.googletagmanager.comstyle-src 'self' 'unsafe-inline' tagmanager.google.com *.googleapis.com;img-src 'self' *.google-analytics.com *.googletagmanager.com;",
    },
  ])("header key '$key' contains value '$value'", async ({ key, value }) => {
    const url = "/";
    const options = {
      method: "GET",
      url,
    };
    const res = await server.inject(options);
    expect(res.headers[key.toLowerCase()]).toEqual(value);
  });
});
