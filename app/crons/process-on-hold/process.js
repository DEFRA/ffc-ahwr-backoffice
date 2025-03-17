const {
  processApplicationClaim,
  getApplications,
} = require("../../api/applications");
const { updateClaimStatus, getClaims } = require("../../api/claims");
const { status } = require("../../../app/constants/status");

const getCommonData = () => {
  const now = new Date();
  return {
    searchType: "status",
    searchText: "ON HOLD",
    date24HrsAgo: now.setDate(now.getDate() - 1),
  };
};
const formatDateForFilter = (timestamp) => {
  const dateString = new Date(timestamp).toLocaleString("en-GB");
  const [date, time] = dateString.split(",");
  const bigEndianDate = date.split("/").reverse().join("-");

  return `${bigEndianDate}${time}`;
};

const processOnHoldApplications = async (logger) => {
  const { searchType, searchText, date24HrsAgo } = getCommonData();
  const apps = await getApplications(
    searchType,
    searchText,
    9999,
    0,
    [],
    { field: "CREATEDAT", direction: "ASC" },
    logger,
  );
  logger.setBindings({ applicationsTotal: apps.total });
  const applicationRefs = apps.applications
    .filter((a) => new Date(a.updatedAt) <= date24HrsAgo)
    .map((a) => a.reference);
  const failedApplicationRefs = [];
  for (const appRef of applicationRefs) {
    try {
      await processApplicationClaim(appRef, "admin", true, logger);
    } catch (_) {
      failedApplicationRefs.push(appRef);
    }
  }

  logger.setBindings({ applicationRefs, failedApplicationRefs });
};

const processOnHoldClaims = async (logger) => {
  const { searchType, searchText, date24HrsAgo } = getCommonData();
  const value = formatDateForFilter(date24HrsAgo);
  const filter = {
    field: "updatedAt",
    op: "lte",
    value,
  };
  const limit = 500;
  const { claims, total } = await getClaims(
    searchType,
    searchText,
    filter,
    limit,
    undefined,
    undefined,
    logger,
  );
  logger.setBindings({ claimsTotal: total });

  const claimRefs = [];
  const failedClaimRefs = [];
  for (const { reference } of claims) {
    try {
      await updateClaimStatus(reference, "admin", status.READY_TO_PAY, logger);
      claimRefs.push(reference);
    } catch (_) {
      failedClaimRefs.push(reference);
    }
  }

  logger.setBindings({ claimRefs, failedClaimRefs });
};

module.exports = {
  processOnHoldClaims,
  processOnHoldApplications,
};
