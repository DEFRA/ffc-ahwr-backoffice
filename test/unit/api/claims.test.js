const wreck = require("@hapi/wreck");
const claims = require("../../data/claims.json");
const { status } = require("../../../app/constants/status");
const {
  getClaim,
  getClaims,
  updateClaimStatus,
  updateClaimData,
} = require("../../../app/api/claims");

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");

describe("Claims API", () => {
  const applicationReference = "AHWR-1234-APP1";

  test("getClaim", async () => {
    const wreckResponse = {
      payload: claims[0],
      res: {
        statusCode: 200,
      },
      json: true,
    };

    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

    const response = await getClaim("AHWR-1111-1111");

    expect(response).toEqual(wreckResponse.payload);
  });

  test("getClaim error", async () => {
    const wreckResponse = {
      res: {
        statusCode: 404,
      },
      json: true,
    };

    wreck.get = jest.fn().mockRejectedValueOnce(wreckResponse);

    const logger = { setBindings: jest.fn() };
    expect(async () => {
      await getClaim("AHWR-2222-2222", logger);
    }).rejects.toEqual(wreckResponse);
  });

  test("getClaims (post)", async () => {
    const wreckResponse = {
      payload: claims,
      res: {
        statusCode: 200,
      },
      json: true,
    };

    wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);

    const response = await getClaims("sbi", "12345");

    expect(response).toEqual(wreckResponse.payload);
  });

  test("getClaims (post) error", async () => {
    const wreckResponse = {
      res: {
        statusCode: 500,
      },
      json: true,
    };

    wreck.post = jest.fn().mockRejectedValueOnce(wreckResponse);

    const logger = { setBindings: jest.fn() };
    const filter = { field: "updatedAt", op: "lte", value: "2025-01-17" };
    expect(async () => {
      await getClaims("sbi", "1010", filter, 10, 10, "ASC", logger);
    }).rejects.toEqual(wreckResponse);
  });

  test("updateClaimStatus", async () => {
    const wreckResponse = {
      payload: claims[0],
      res: {
        statusCode: 200,
      },
      json: true,
    };

    wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse);

    const response = await updateClaimStatus(applicationReference, "Admin", status.IN_CHECK);

    expect(response).toEqual(wreckResponse.payload);
  });

  test("updateClaimStatus error", async () => {
    const wreckResponse = {
      payload: claims[0],
      res: {
        statusCode: 400,
      },
      json: true,
    };

    wreck.put = jest.fn().mockRejectedValueOnce(wreckResponse);
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await updateClaimStatus(applicationReference, "Admin", status.IN_CHECK, logger);
    }).rejects.toEqual(wreckResponse);
  });
  test("updateClaimData", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 204,
      },
      json: true,
    };
    const logger = { setBindings: jest.fn() };

    wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse);

    const response = await updateClaimData(
      applicationReference,
      {
        vetsName: "John Doe",
        dateOfVisit: "2025-01-17",
        vetRCVSNumber: "123456",
      },
      "my note",
      "Admin",
      logger,
    );

    expect(response).toEqual(wreckResponse.payload);
  });

  test("updateClaimData error", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 400,
      },
      json: true,
    };

    wreck.put = jest.fn().mockRejectedValueOnce(wreckResponse);
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await updateClaimData(
        applicationReference,
        {
          vetsName: "John Doe",
          dateOfVisit: "2025-01-17",
          vetRCVSNumber: "123456",
        },
        "my note",
        "Admin",
        logger,
      );
    }).rejects.toEqual(wreckResponse);
  });
});
