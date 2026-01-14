import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { StatusCodes } from "http-status-codes";

const { applicationApiUri } = config;

export async function getAllFlags(logger) {
  const endpoint = `${applicationApiUri}/flags`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

export async function deleteFlag({ _flagId, _deletedNote }, _user, _logger) {
  return { res: { statusCode: StatusCodes.OK } };
}

export async function createFlag(_payload, _appRef, _logger) {
  return { res: { statusCode: StatusCodes.OK } };
}
