const { processApplicationClaim, getApplications } = require('../../api/applications')
const processOnHoldApplications = async () => {
  try {
    const searchType = 'status'
    const searchText = 'on hold'
    const apps = await getApplications(searchType, searchText, 0, 9999, [], null)
    if (apps.total > 0) {
      const applicationRefs = apps.applications.map(a => a.reference)
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
