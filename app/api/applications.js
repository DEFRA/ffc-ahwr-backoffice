import wreck from "@hapi/wreck";
import { config } from "../config/index.js";

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

export async function processApplicationClaim(reference, user, approved, logger, note) {
  const endpoint = `${applicationApiUri}/application/claim`;
  const options = {
    payload: {
      reference,
      user,
      approved,
      note,
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

export async function updateApplicationStatus(reference, user, status, logger, note) {
  const endpoint = `${applicationApiUri}/application/${reference}`;
  const options = {
    payload: {
      user,
      status,
      note,
    },
    json: true,
  };
  try {
    const { payload } = await wreck.put(endpoint, options);
    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

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

export async function updateApplicationData(reference, data, note, name, logger) {
  const endpoint = `${applicationApiUri}/applications/${reference}/data`;
  logger.setBindings({ endpoint });
  const options = {
    payload: {
      ...data,
      note,
      user: name,
    },
  };

  const { payload } = await wreck.put(endpoint, options);
  return payload;
}
