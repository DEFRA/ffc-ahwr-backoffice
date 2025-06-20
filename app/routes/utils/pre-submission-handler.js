import boom from "@hapi/boom";
import { lookupSubmissionCrumb, cacheSubmissionCrumb } from "./crumb-cache.js";

export const preSubmissionHandler = async (request, h) => {
  if (request.method === "post") {
    const lookupCrumb = await lookupSubmissionCrumb(request);

    if (lookupCrumb?.crumb) {
      request.logger.setBindings({ crumb: request.plugins.crumb });
      return boom.forbidden("Duplicate submission");
    }

    await cacheSubmissionCrumb(request);
    return h.continue;
  }

  return h.continue;
};
