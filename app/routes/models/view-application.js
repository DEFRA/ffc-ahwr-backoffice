const getFarmerApplication = require('./farmer-application')
const getOrganisationRows = require('./application-organisation')
const getClaimData = require('./application-claim')
const getHistoryData = require('./application-history')

const claimDataStatus = ['IN CHECK', 'REJECTED', 'READY TO PAY']

function ViewModel (application, applicationHistory) {
  this.model = {
    applicationData: getFarmerApplication(application),
    listData: { rows: getOrganisationRows(application?.data?.organisation) },
    claimData: application?.claimed || claimDataStatus.includes(application?.status?.status) ? getClaimData(application) : false,
    historyData: getHistoryData(applicationHistory)
  }
}

module.exports = ViewModel
