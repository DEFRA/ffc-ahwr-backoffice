import wreck from "@hapi/wreck";
import { getAllFlags, deleteFlag, createFlag } from "../../../app/api/flags";
import { flags } from "../../data/flags.js";
import { config } from "../../../app/config";

const { applicationApiUri } = config;

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

  describe("deleteFlag", () => {
    test("uses the provided flagId in the params of the request, and the user in the payload", async () => {
      const wreckResponse = {
        payload: {},
        res: {
          statusCode: 200,
        },
        json: true,
      };

      wreck.patch = jest.fn().mockResolvedValueOnce(wreckResponse);

      const username = "Tom the deleter";
      const flagId = "abc123";
      const deletedNote = "Remove flag";

      await deleteFlag({ flagId, deletedNote }, username, mockLogger);

      expect(wreck.patch).toHaveBeenCalledWith(
        `${applicationApiUri}/application/flag/${flagId}/delete`,
        {
          json: true,
          payload: {
            user: username,
            deletedNote,
          },
        },
      );
      expect(mockLogger.setBindings).not.toHaveBeenCalled();
    });

    test("throws an error if the patch call errors", async () => {
      wreck.patch = jest.fn().mockImplementationOnce(() => {
        throw new Error("test error");
      });

      expect(async () => await deleteFlag("", "", mockLogger)).rejects.toThrow("test error");
      expect(mockLogger.setBindings).toHaveBeenCalled();
    });
  });

  describe("createFlag", () => {
    test("uses the provided application reference in the params of the request, and the payload provided as the payload of the API request", async () => {
      const wreckResponse = {
        payload: {},
        res: {
          statusCode: 201,
        },
        json: true,
      };

      wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);

      const applicationReference = "IAHW-TEST-REFR";
      const payload = {
        user: "Tom",
        note: "I flagged this",
        appliesToMh: "yes",
      };

      await createFlag(payload, applicationReference, mockLogger);

      expect(wreck.post).toHaveBeenCalledWith(
        `${applicationApiUri}/application/${applicationReference}/flag`,
        {
          json: true,
          payload,
        },
      );

      expect(mockLogger.setBindings).not.toHaveBeenCalled();
    });

    test("throws an error if the post call errors", async () => {
      wreck.post = jest.fn().mockImplementationOnce(() => {
        throw new Error("test error");
      });

      expect(async () => await createFlag({}, "", mockLogger)).rejects.toThrow("test error");
      expect(mockLogger.setBindings).toHaveBeenCalled();
    });
  });
});
