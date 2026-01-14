import wreck from "@hapi/wreck";
import { claims } from "../../data/claims.js";
import { getClaim, getClaims, updateClaimData, updateClaimStatus } from "../../../app/api/claims";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");

describe("Claims API", () => {
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

  it("updateClaimStatus should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await updateClaimStatus(undefined, "test", 2);
    expect(response).toStrictEqual(wreckResponse);
  });

  it("updateClaimData should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await updateClaimData(undefined, "test", 2);
    expect(response).toStrictEqual(wreckResponse);
  });
});
