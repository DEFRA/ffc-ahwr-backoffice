import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { StatusCodes } from "http-status-codes";

const { applicationApiUri } = config;

export async function getClaim(reference, logger) {
  const endpoint = `${applicationApiUri}/claim/get-by-reference/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

export async function getClaims(searchType, searchText, filter, limit, offset, sort, logger) {
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

export async function updateClaimStatus(_reference, _user, _status, _logger, _note) {
  return Promise.resolve({ res: { statusCode: StatusCodes.OK } });
}

export async function updateClaimData(_reference, _data, _note, _name, _logger) {
  return Promise.resolve({ res: { statusCode: StatusCodes.OK } });
}
