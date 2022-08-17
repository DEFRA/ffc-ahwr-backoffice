const getFarmerApplication = require('./farmer-application')
const getVetVisitData = require('./vet-visit-review')
const getOrganisationRows = require('./application-organisation')
const getPaymentData = require('./application-payment')
const getClaimData = require('./application-claim')

function ViewModel (application) {
  this.model = {
    applicationData: getFarmerApplication(application),
    vetVisitData: application?.vetVisit ? getVetVisitData(application.vetVisit, application?.data?.whichReview) : false,
    listData: { rows: getOrganisationRows(application?.data?.organisation) },
    paymentData: application?.payment ? getPaymentData(application?.payment) : false,
    claimData: application?.claimed ? getClaimData(application?.updatedAt) : false
  }
}

module.exports = ViewModel
