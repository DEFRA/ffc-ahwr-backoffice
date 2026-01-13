import wreck from "@hapi/wreck";
import { getAllFlags } from "../../../app/api/flags";
import { flags } from "../../data/flags.js";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");

const mockLogger = {
  setBindings: jest.fn(),
};

describe("Flags API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllFlags", () => {
    test("returns the payload provided", async () => {
      const wreckResponse = {
        payload: flags,
        res: {
          statusCode: 200,
        },
        json: true,
      };

      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await getAllFlags(mockLogger);

      expect(response).toEqual(wreckResponse.payload);
      expect(mockLogger.setBindings).not.toHaveBeenCalled();
    });

    test("getAllFlags throws an error if the get call errors", async () => {
      wreck.get = jest.fn().mockImplementationOnce(() => {
        throw new Error("test error");
      });

      expect(async () => await getAllFlags(mockLogger)).rejects.toThrow("test error");
      expect(mockLogger.setBindings).toHaveBeenCalled();
    });
  });
});
