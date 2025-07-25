import { processOnHoldApplications } from "../../../app/crons/process-on-hold/process";
import { processApplicationClaim, getApplications } from "../../../app/api/applications";

jest.mock("../../../app/api/applications");
jest.mock("../../../app/config", () => ({
  ...jest.requireActual("../../../app/config"),
  onHoldAppScheduler: {
    enabled: true,
    schedule: "0 18 * * 1-5",
  },
}));

const MOCK_NOW = new Date();

describe("Process process on hold applications function test.", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);

    processApplicationClaim.mockResolvedValue(true);
    getApplications.mockResolvedValue({
      applications: [
        {
          reference: "ABC-XYZ-123",
          updatedAt: "2023-10-01T19:40:00.424Z",
        },
      ],
      total: 1,
    });
  });

  afterAll(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("test error while running process", async () => {
    getApplications.mockRejectedValueOnce("getApplications boom");

    expect(async () => {
      await processOnHoldApplications();
    }).rejects.toBe("getApplications boom");
  });

  test("test error handled no pending application", async () => {
    getApplications.mockResolvedValue({
      applications: [],
      total: 0,
    });
    const server = { setBindings: jest.fn() };
    await processOnHoldApplications(server);

    expect(getApplications).toHaveBeenCalled();
    expect(processApplicationClaim).not.toHaveBeenCalled();
  });

  test("success to process on hold application", async () => {
    getApplications.mockResolvedValueOnce({
      applications: [
        {
          reference: "ABC-XYZ-123",
          updatedAt: "2023-10-01T19:40:00.424Z",
        },
      ],
      total: 1,
    });
    const logger = { setBindings: jest.fn() };
    await processOnHoldApplications(logger);

    expect(getApplications).toHaveBeenCalled();
    expect(processApplicationClaim).toHaveBeenCalled();
  });

  test("success to process on hold application - no application", async () => {
    getApplications.mockResolvedValueOnce({
      applications: [
        {
          reference: "ABC-XYZ-123",
          updatedAt: new Date(),
        },
      ],
      total: 1,
    });
    const logger = { setBindings: jest.fn() };
    await processOnHoldApplications(logger);

    expect(getApplications).toHaveBeenCalled();
    expect(processApplicationClaim).not.toHaveBeenCalled();
  });

  test("captures failed updates", async () => {
    getApplications.mockResolvedValueOnce({
      applications: [
        {
          reference: "ABC-XYZ-123",
          updatedAt: "2023-10-01T19:40:00.424Z",
        },
        {
          reference: "ABC-XYZ-456",
          updatedAt: "2023-10-01T19:40:00.424Z",
        },
      ],
      total: 2,
    });
    processApplicationClaim.mockRejectedValueOnce(new Error("boom"));
    const logger = { setBindings: jest.fn() };
    await processOnHoldApplications(logger);

    expect(logger.setBindings.mock.calls).toEqual([
      [{ applicationsTotal: 2 }],
      [
        {
          applicationRefs: ["ABC-XYZ-123", "ABC-XYZ-456"],
          failedApplicationRefs: ["ABC-XYZ-123"],
        },
      ],
    ]);
  });
});
