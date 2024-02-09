const getFarmerApplication = require('./farmer-application')
const getOrganisationRows = require('./application-organisation')
const getClaimData = require('./application-claim')
const getHistoryData = require('./application-history')
const getRecommendData = require('./recommend-claim')

const claimDataStatus = ['IN CHECK', 'REJECTED', 'READY TO PAY', 'ON HOLD', 'Recommended to Pay', 'Recommended to Reject']

function ViewModel (application, applicationHistory, recommend, applicationEvents) {
  var recommendFormData = getRecommendData(recommend)
  this.model = {
    applicationData: getFarmerApplication(application),
    listData: { rows: getOrganisationRows(application?.data?.organisation) },
    claimData: application?.claimed || claimDataStatus.includes(application?.status?.status) ? getClaimData(application, applicationEvents) : false,
    historyData: getHistoryData(applicationHistory),
    recommendData: Object.entries(recommendFormData).length ===0 ? false : recommendFormData
  }
}

module.exports = ViewModel
