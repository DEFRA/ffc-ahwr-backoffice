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

export async function deleteFlag({ flagId, deletedNote }, user, logger) {
  const endpoint = `${applicationApiUri}/application/flag/${flagId}/delete`;
  try {
    await wreck.patch(endpoint, { json: true, payload: { user, deletedNote } });
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

export async function createFlag(payload, appRef, logger) {
  const endpoint = `${applicationApiUri}/application/${appRef}/flag`;
  try {
    return wreck.post(endpoint, { json: true, payload });
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}
