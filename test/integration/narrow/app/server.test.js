import { createServer } from "../../../../app/server.js";

jest.mock("../../../../app/crons/process-on-hold/scheduler.js");
jest.mock("../../../../app/crons/data-redaction/scheduler.js");

describe("Server test", () => {
  test("createServer returns server", async () => {
    process.env.NODE_ENV = "production";
    const server = await createServer();
    expect(server).toBeDefined();
  });

  test("createServer returns server when env is test", async () => {
    process.env.NODE_ENV = "test";
    const server = await createServer();
    expect(server).toBeDefined();
  });
});
