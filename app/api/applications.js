import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { StatusCodes } from "http-status-codes";

const { applicationApiUri } = config;

export async function getApplication(applicationReference, logger) {
  const endpoint = `${applicationApiUri}/application/get/${applicationReference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

export async function getApplications(
  searchType,
  searchText,
  limit,
  offset,
  filterStatus,
  sort,
  logger,
) {
  const endpoint = `${applicationApiUri}/application/search`;
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      limit,
      offset,
      filter: filterStatus,
      sort,
    },
    json: true,
  };
  try {
    const { payload } = await wreck.post(endpoint, options);
    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

export async function processApplicationClaim(_reference, _user, _approved, _logger, _note) {}

export async function updateApplicationStatus(_reference, _user, _status, _logger, _note) {}

export async function getApplicationHistory(reference, logger) {
  const endpoint = `${applicationApiUri}/application/history/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

export async function getApplicationEvents(reference, logger) {
  const endpoint = `${applicationApiUri}/application/events/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (err) {
    logger.setBindings({ err });
    throw err;
  }
}

export async function updateApplicationData(_reference, _data, _note, _name, _logger) {
  return Promise.resolve({ res: { statusCode: StatusCodes.OK } });
}

export async function redactPiiData(_logger) {
  return Promise.resolve({ res: { statusCode: StatusCodes.OK } });
}

export async function updateEligiblePiiRedaction(_reference, _data, _note, _name, _logger) {
  return Promise.resolve({ res: { statusCode: StatusCodes.OK } });
}

export async function triggerReminderEmailProcess(_logger) {
  return Promise.resolve({ res: { statusCode: StatusCodes.OK } });
}
