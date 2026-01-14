import wreck from "@hapi/wreck";
import { config } from "../../../app/config";
import {
  getApplications,
  getApplication,
  getApplicationHistory,
  getApplicationEvents,
  updateApplicationStatus,
  processApplicationClaim,
  triggerReminderEmailProcess,
  updateEligiblePiiRedaction,
  redactPiiData,
  updateApplicationData,
} from "../../../app/api/applications";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");

const { applicationApiUri } = config;
const appRef = "ABC-1234";
const limit = 20;
const offset = 0;
const searchText = "";
const searchType = "";

describe("Application API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getApplications should return applications", async () => {
    const wreckResponse = {
      payload: {
        applications: [{}, {}],
        total: 0,
      },
      res: {
        statusCode: 502,
      },
    };
    const options = {
      payload: {
        search: { text: searchText, type: searchType },
        limit,
        offset,
      },
      json: true,
    };
    wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);
    const response = await getApplications(searchType, searchText, limit, offset);

    expect(response).toEqual(wreckResponse.payload);
    expect(wreck.post).toHaveBeenCalledTimes(1);
    expect(wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/application/search`, options);
  });

  it("getApplication should return null application", async () => {
    const wreckResponse = {
      payload: null,
      res: {
        statusCode: 502,
      },
    };
    const options = { json: true };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const response = await getApplication(appRef);

    expect(response).toEqual(wreckResponse.payload);
    expect(wreck.get).toHaveBeenCalledTimes(1);
    expect(wreck.get).toHaveBeenCalledWith(
      `${applicationApiUri}/application/get/${appRef}`,
      options,
    );
  });

  it("getApplication should return an application", async () => {
    const applicationData = {
      reference: appRef,
    };
    const wreckResponse = {
      payload: applicationData,
      res: {
        statusCode: 200,
      },
    };
    const options = { json: true };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const response = await getApplication(appRef);

    expect(response).toEqual(wreckResponse.payload);
    expect(wreck.get).toHaveBeenCalledTimes(1);
    expect(wreck.get).toHaveBeenCalledWith(
      `${applicationApiUri}/application/get/${appRef}`,
      options,
    );
  });

  it("getApplications should throw errors", async () => {
    const filter = [];
    const sort = "ASC";

    const options = {
      payload: {
        search: { text: searchText, type: searchType },
        limit,
        offset,
        filter,
        sort,
      },
      json: true,
    };
    wreck.post = jest.fn().mockRejectedValueOnce("getApplications boom");
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await getApplications(searchType, searchText, limit, offset, filter, sort, logger);
    }).rejects.toBe("getApplications boom");
    expect(wreck.post).toHaveBeenCalledTimes(1);
    expect(wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/application/search`, options);
  });

  it("getApplication should throw errors", async () => {
    const options = { json: true };
    wreck.get = jest.fn().mockRejectedValueOnce("getApplication boom");
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await getApplication(appRef, logger);
    }).rejects.toBe("getApplication boom");

    expect(wreck.get).toHaveBeenCalledTimes(1);
    expect(wreck.get).toHaveBeenCalledWith(
      `${applicationApiUri}/application/get/${appRef}`,
      options,
    );
  });

  it("getApplicationHistory should return history records", async () => {
    const wreckResponse = {
      payload: {
        historyRecords: [{}, {}, {}],
      },
      res: {
        statusCode: 200,
      },
    };

    const options = { json: true };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const response = await getApplicationHistory(appRef);
    expect(response).toEqual(wreckResponse.payload);
    expect(wreck.get).toHaveBeenCalledTimes(1);
    expect(wreck.get).toHaveBeenCalledWith(
      `${applicationApiUri}/application/history/${appRef}`,
      options,
    );
  });

  it("getApplicationHistory should throw errors", async () => {
    const options = { json: true };
    wreck.get = jest.fn().mockRejectedValueOnce("getApplicationHistory boom");
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await getApplicationHistory(appRef, logger);
    }).rejects.toBe("getApplicationHistory boom");
    expect(wreck.get).toHaveBeenCalledTimes(1);
    expect(wreck.get).toHaveBeenCalledWith(
      `${applicationApiUri}/application/history/${appRef}`,
      options,
    );
  });

  it("getApplicationEvents should return records", async () => {
    const wreckResponse = {
      payload: {
        eventRecords: [{}, {}],
      },
      res: {
        statusCode: 200,
      },
    };

    const options = { json: true };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const response = await getApplicationEvents(appRef);

    expect(response).toEqual(wreckResponse.payload);

    expect(wreck.get).toHaveBeenCalledTimes(1);
    expect(wreck.get).toHaveBeenCalledWith(
      `${applicationApiUri}/application/events/${appRef}`,
      options,
    );
  });

  it("getApplicationEvents should throw errors", async () => {
    const options = { json: true };
    wreck.get = jest.fn().mockRejectedValueOnce("getApplicationEvents boom");
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await getApplicationEvents(appRef, logger);
    }).rejects.toBe("getApplicationEvents boom");
    expect(wreck.get).toHaveBeenCalledTimes(1);
    expect(wreck.get).toHaveBeenCalledWith(
      `${applicationApiUri}/application/events/${appRef}`,
      options,
    );
  });

  it("updateApplicationStatus should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await updateApplicationStatus(appRef, "test", 2);
    expect(response).toStrictEqual(wreckResponse);
  });

  it("processApplicationClaim should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await processApplicationClaim(appRef, "test", undefined, undefined, undefined);
    expect(response).toStrictEqual(wreckResponse);
  });

  it("updateApplicationData should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await updateApplicationData(appRef, "test", undefined, undefined, undefined);
    expect(response).toStrictEqual(wreckResponse);
  });

  it("redactPiiData should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await redactPiiData(undefined);
    expect(response).toStrictEqual(wreckResponse);
  });

  it("updateEligiblePiiRedaction should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await updateEligiblePiiRedaction(
      appRef,
      "test",
      undefined,
      undefined,
      undefined,
    );
    expect(response).toStrictEqual(wreckResponse);
  });

  it("triggerReminderEmailProcess should return on success", async () => {
    const wreckResponse = {
      res: {
        statusCode: 200,
      },
    };
    const response = await triggerReminderEmailProcess(undefined);
    expect(response).toStrictEqual(wreckResponse);
  });
});
