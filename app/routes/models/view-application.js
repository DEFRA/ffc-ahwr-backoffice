const getFarmerApplication = require('./farmer-application')
const getOrganisationRows = require('./application-organisation')
const getClaimData = require('./application-claim')
const getHistoryData = require('./application-history')
const getRecommendData = require('./recommend-claim')

const claimDataStatus = ['IN CHECK', 'REJECTED', 'READY TO PAY']

function ViewModel (application, applicationHistory, recommend) {
  this.model = {
    applicationData: getFarmerApplication(application),
    listData: { rows: getOrganisationRows(application?.data?.organisation) },
    claimData: application?.claimed || claimDataStatus.includes(application?.status?.status) ? getClaimData(application) : false,
    historyData: getHistoryData(applicationHistory),
    recommendData: getRecommendData(recommend)
  }
}

module.exports = ViewModel
