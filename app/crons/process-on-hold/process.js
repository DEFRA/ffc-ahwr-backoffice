const { processApplicationClaim, getApplications } = require('../../api/applications')
const { updateClaimStatus, getClaims } = require('../../api/claims')
const { status } = require('../../../app/constants/status')

const getCommonData = () => {
  const now = new Date()
  return { searchType: 'status', searchText: 'ON HOLD', datePast24Hrs: now.setDate(now.getDate() - 1) }
}

const processOnHoldApplications = async () => {
  try {
    const { searchType, searchText, datePast24Hrs } = getCommonData()
    const apps = await getApplications(searchType, searchText, 9999, 0, [], { field: 'CREATEDAT', direction: 'ASC' })

    if (apps.total > 0) {
      const applicationRefs = apps.applications.filter(a => new Date(a.updatedAt) <= datePast24Hrs).map(a => a.reference)
      console.log(`${new Date().toISOString()} processing OnHold applications:processing records: ${JSON.stringify({ applicationRefs })}`)
      for (const appRef of applicationRefs) {
        await processApplicationClaim(appRef, 'admin', true)
        console.log(`${new Date().toISOString()} processing OnHold applications:processing : ${JSON.stringify({ appRef })}`)
      }
      return true
    } else {
      console.log(`${new Date().toISOString()} processing OnHold applications:Nothing to process today`)
    }
  } catch (error) {
    console.log(error)
  }
  return false
}
const processOnHoldClaims = async () => {
  try {
    const { searchType, searchText, datePast24Hrs } = getCommonData()
    const { claims, total } = await getClaims(searchType, searchText)

    if (total > 0) {
      const claimRefs = claims.filter(a => new Date(a.updatedAt) <= datePast24Hrs).map(a => a.reference)
      console.log(`${new Date().toISOString()} - processing OnHold claims: processing records: ${JSON.stringify({ claimRefs })}`)
      for (const claimRef of claimRefs) {
        await updateClaimStatus(claimRef, 'admin', status.READY_TO_PAY)
        console.log(`${new Date().toISOString()} processing OnHold claims: processing : ${JSON.stringify({ claimRef })}`)
      }
      return true
    } else {
      console.log(`${new Date().toISOString()} - processing OnHold claims: Nothing to process today`)
    }
  } catch (error) {
    console.log(error)
  }
  return false
}

module.exports = {
  processOnHoldClaims,
  processOnHoldApplications
}
