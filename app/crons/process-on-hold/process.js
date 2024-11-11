const { processApplicationClaim, getApplications } = require('../../api/applications')
const { updateClaimStatus, getClaims } = require('../../api/claims')
const { status } = require('../../../app/constants/status')

const getCommonData = () => {
  const now = new Date()
  return { searchType: 'status', searchText: 'ON HOLD', datePast24Hrs: now.setDate(now.getDate() - 1) }
}

const processOnHoldApplications = async (logger) => {
  const { searchType, searchText, datePast24Hrs } = getCommonData()
  const apps = await getApplications(searchType, searchText, 9999, 0, [], { field: 'CREATEDAT', direction: 'ASC' }, logger)
  logger.setBindings({ applicationsTotal: apps.total })
  if (apps.total > 0) {
    const applicationRefs = apps.applications.filter(a => new Date(a.updatedAt) <= datePast24Hrs).map(a => a.reference)
    logger.setBindings({ applicationRefs })
    for (const appRef of applicationRefs) {
      await processApplicationClaim(appRef, 'admin', true, logger)
    }
  }
}
const processOnHoldClaims = async (logger) => {
  const { searchType, searchText, datePast24Hrs } = getCommonData()
  const { claims, total } = await getClaims(searchType, searchText)
  logger.setBindings({ claimsTotal: total })
  if (total > 0) {
    const claimRefs = claims.filter(a => new Date(a.updatedAt) <= datePast24Hrs).map(a => a.reference)
    logger.setBindings({ claimRefs })
    for (const claimRef of claimRefs) {
      await updateClaimStatus(claimRef, 'admin', status.READY_TO_PAY, logger)
    }
  }
}

module.exports = {
  processOnHoldClaims,
  processOnHoldApplications
}
