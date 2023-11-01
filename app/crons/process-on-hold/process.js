const { processApplicationClaim, getApplications } = require('../../api/applications')
const processOnHoldApplications = async () => {
  try {
    const searchType = 'status'
    const searchText = 'ON HOLD'
    const apps = await getApplications(searchType, searchText, 9999, 0, [], { field: 'CREATEDAT', direction: 'ASC' })
    const datePast24Hrs = new Date()
    datePast24Hrs.setDate(datePast24Hrs.getDate() - 1)
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

module.exports = processOnHoldApplications
