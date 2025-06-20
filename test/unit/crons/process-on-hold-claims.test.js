import { updateClaimStatus, getClaims } from "../../../app/api/claims";
import { processOnHoldClaims } from "../../../app/crons/process-on-hold/process";

jest.mock("../../../app/api/claims");

const MOCK_NOW = new Date();

describe("Process process on hold claims function test.", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
    jest.mock("../../../app/config", () => ({
      ...jest.requireActual("../../../app/config"),
      onHoldAppScheduler: {
        enabled: true,
        schedule: "0 18 * * 1-5",
      },
    }));
    updateClaimStatus.mockResolvedValue(true);
    getClaims.mockResolvedValue({
      claims: [
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
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("error while running process", async () => {
    getClaims.mockRejectedValueOnce("getClaims boom");

    expect(async () => {
      await processOnHoldClaims();
    }).rejects.toBe("getClaims boom");
  });

  test("no pending claims", async () => {
    getClaims.mockResolvedValue({
      claims: [],
      total: 0,
    });
    const logger = { setBindings: jest.fn() };
    await processOnHoldClaims(logger);

    expect(getClaims).toHaveBeenCalled();
    expect(updateClaimStatus).not.toHaveBeenCalled();
  });

  test("success to process on hold claims", async () => {
    getClaims.mockResolvedValueOnce({
      claims: [
        {
          reference: "ABC-XYZ-123",
          updatedAt: "2023-10-01T19:40:00.424Z",
        },
      ],
      total: 1,
    });

    const logger = { setBindings: jest.fn() };
    await processOnHoldClaims(logger);

    expect(getClaims).toHaveBeenCalled();
    expect(updateClaimStatus).toHaveBeenCalled();
  });

  test("captures failed updates", async () => {
    getClaims.mockResolvedValueOnce({
      claims: [
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
    updateClaimStatus.mockRejectedValueOnce(new Error("boom"));

    const logger = { setBindings: jest.fn() };
    await processOnHoldClaims(logger);

    expect(logger.setBindings.mock.calls).toEqual([
      [{ claimsTotal: 2 }],
      [
        {
          claimRefs: ["ABC-XYZ-456"],
          failedClaimRefs: ["ABC-XYZ-123"],
        },
      ],
    ]);
  });
});
