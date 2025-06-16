export const lookupSubmissionCrumb = async (request) => {
  const { submissionCrumbCache } = request.server.app;
  // await submissionCrumbCache.get doesnt seem to be a thing?
  console.log(process.env.NODE_ENV);
  return (await submissionCrumbCache.get(request.plugins.crumb)) ?? {};
};

export const cacheSubmissionCrumb = async (request) => {
  // Doesnt currently get called because lookupSubmissionCrumb always fails
  const { submissionCrumbCache } = request.server.app;
  const crumb = request.plugins.crumb;
  await submissionCrumbCache.set(crumb, { crumb });
};

export const generateNewCrumb = async (request, h) => {
  request.plugins.crumb = null;
  await request.server.plugins.crumb.generate(request, h);
};
