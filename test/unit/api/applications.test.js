const wreck = require("@hapi/wreck");
jest.mock("@hapi/wreck");
jest.mock("../../../app/config");
const { applicationApiUri } = require("../../../app/config");
const appRef = "ABC-1234";
const limit = 20;
const offset = 0;
const searchText = "";
const searchType = "";
const {
  getApplications,
  getApplication,
  updateApplicationStatus,
  processApplicationClaim,
  getApplicationHistory,
  getApplicationEvents,
} = require("../../../app/api/applications");
describe("Application API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getApplications should return applications", async () => {
    jest.mock("@hapi/wreck");
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
    const response = await getApplications(
      searchType,
      searchText,
      limit,
      offset,
    );

    expect(response).toEqual(wreckResponse.payload);
    expect(wreck.post).toHaveBeenCalledTimes(1);
    expect(wreck.post).toHaveBeenCalledWith(
      `${applicationApiUri}/application/search`,
      options,
    );
  });

  it("getApplication should return null application", async () => {
    jest.mock("@hapi/wreck");
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
    jest.mock("@hapi/wreck");
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
    jest.mock("@hapi/wreck");
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
      await getApplications(
        searchType,
        searchText,
        limit,
        offset,
        filter,
        sort,
        logger,
      );
    }).rejects.toBe("getApplications boom");
    expect(wreck.post).toHaveBeenCalledTimes(1);
    expect(wreck.post).toHaveBeenCalledWith(
      `${applicationApiUri}/application/search`,
      options,
    );
  });

  it("GetApplication should throw errors", async () => {
    jest.mock("@hapi/wreck");
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

  it("updateApplicationStatus should throw errors", async () => {
    jest.mock("@hapi/wreck");
    const options = {
      payload: {
        user: "test",
        status: 2,
      },
      json: true,
    };
    wreck.put = jest.fn().mockRejectedValueOnce("updateApplicationStatus boom");
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await updateApplicationStatus(appRef, "test", 2, logger);
    }).rejects.toBe("updateApplicationStatus boom");

    expect(wreck.put).toHaveBeenCalledTimes(1);
    expect(wreck.put).toHaveBeenCalledWith(
      `${applicationApiUri}/application/${appRef}`,
      options,
    );
  });

  it("updateApplicationStatus should return on success", async () => {
    jest.mock("@hapi/wreck");
    const options = {
      payload: {
        user: "test",
        status: 2,
      },
      json: true,
    };
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };

    wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse);
    const response = await updateApplicationStatus(appRef, "test", 2);

    expect(response).toEqual(wreckResponse.payload);
    expect(wreck.put).toHaveBeenCalledTimes(1);
    expect(wreck.put).toHaveBeenCalledWith(
      `${applicationApiUri}/application/${appRef}`,
      options,
    );
  });

  it("processApplicationClaim should throw errors", async () => {
    jest.mock("@hapi/wreck");
    const options = {
      payload: {
        user: "test",
        approved: false,
        reference: appRef,
      },
      json: true,
    };
    wreck.post = jest
      .fn()
      .mockRejectedValueOnce("processApplicationClaim boom");
    const logger = { setBindings: jest.fn() };

    expect(async () => {
      await processApplicationClaim(appRef, "test", false, logger);
    }).rejects.toBe("processApplicationClaim boom");
    expect(wreck.post).toHaveBeenCalledTimes(1);
    expect(wreck.post).toHaveBeenCalledWith(
      `${applicationApiUri}/application/claim`,
      options,
    );
  });

  it("processApplicationClaim should return on success", async () => {
    jest.mock("@hapi/wreck");
    const options = {
      payload: {
        user: "test",
        approved: true,
        reference: appRef,
      },
      json: true,
    };
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };

    wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);
    const response = await processApplicationClaim(appRef, "test", true);

    expect(response).toEqual(wreckResponse.payload);
    expect(wreck.post).toHaveBeenCalledTimes(1);
    expect(wreck.post).toHaveBeenCalledWith(
      `${applicationApiUri}/application/claim`,
      options,
    );
  });

  it("getApplicationHistory should return history records", async () => {
    jest.mock("@hapi/wreck");

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
    jest.mock("@hapi/wreck");

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
    jest.mock("@hapi/wreck");
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
    jest.mock("@hapi/wreck");

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
});
