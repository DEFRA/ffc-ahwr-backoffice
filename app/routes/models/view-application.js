const getFarmerApplication = require('./farmer-application')
const getOrganisationRows = require('./application-organisation')
const getClaimData = require('./application-claim')

const claimDataStatus = ['IN CHECK', 'REJECTED', 'READY TO PAY']

function ViewModel (application) {
  this.model = {
    applicationData: getFarmerApplication(application),
    listData: { rows: getOrganisationRows(application?.data?.organisation) },
    claimData: application?.claimed || claimDataStatus.includes(application?.status?.status) ? getClaimData(application) : false
  }
}

module.exports = ViewModel
