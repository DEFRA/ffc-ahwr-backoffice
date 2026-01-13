import wreck from "@hapi/wreck";
import { config } from "../config/index.js";

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

export async function deleteFlag({ flagId, deletedNote }, _user, _logger) {}

export async function createFlag(_payload, _appRef, _logger) {}
