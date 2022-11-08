const getFarmerApplication = require('./farmer-application')
const getOrganisationRows = require('./application-organisation')
const getClaimData = require('./application-claim')

function ViewModel (application) {
  this.model = {
    applicationData: getFarmerApplication(application),
    listData: { rows: getOrganisationRows(application?.data?.organisation) },
    claimData: application?.claimed ? getClaimData(application) : false
  }
}

module.exports = ViewModel
