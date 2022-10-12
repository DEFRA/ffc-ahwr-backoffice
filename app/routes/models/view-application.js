const getFarmerApplication = require('./farmer-application')
const getOrganisationRows = require('./application-organisation')
const getPaymentData = require('./application-payment')
const getClaimData = require('./application-claim')

function ViewModel (application) {
  this.model = {
    applicationData: getFarmerApplication(application),
    listData: { rows: getOrganisationRows(application?.data?.organisation) },
    paymentData: application?.payment ? getPaymentData(application?.payment) : false,
    claimData: application?.claimed ? getClaimData(application?.updatedAt) : false
  }
}

module.exports = ViewModel
