const wreck = require("@hapi/wreck");
const { applicationApiUri } = require("../config");

async function getClaim(reference, logger) {
  const endpoint = `${applicationApiUri}/claim/get-by-reference/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

async function getClaims(
  searchType,
  searchText,
  filter,
  limit,
  offset,
  sort,
  logger,
) {
  const endpoint = `${applicationApiUri}/claim/search`;
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      filter,
      limit,
      offset,
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

async function updateClaimStatus(reference, user, status, logger, note) {
  const endpoint = `${applicationApiUri}/claim/update-by-reference`;
  const options = {
    payload: {
      reference,
      status,
      user,
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

async function updateClaimData(reference, data, note, name, logger) {
  const endpoint = `${applicationApiUri}/claims/${reference}/data`;
  logger.setBindings({ endpoint });
  const options = {
    payload: {
      ...data,
      note,
      user: name,
    },
  };

  const { payload } = await wreck.patch(endpoint, options);
  return payload;
}

module.exports = {
  getClaim,
  getClaims,
  updateClaimData,
  updateClaimStatus,
};
