const { Buffer } = require('buffer')
const joi = require('joi')
const mapAuth = require('../auth/map-auth')
const { getApplication, getApplicationHistory, getApplicationEvents } = require('../api/applications')
const { administrator, processor, user, recommender, authoriser } = require('../auth/permissions')
const { getStyleClassByStatus, status: claimStatuses } = require('../constants/status')
const { getClaimViewStates } = require('./utils/get-claim-view-states')
const { getCurrentStatusEvent } = require('./utils/get-current-status-event')
const applicationStatus = require('../constants/application-status')
const { getErrorMessagesByKey } = require('./utils/get-error-messages-by-key')
const { getContactHistory, displayContactHistory } = require('../api/contact-history')
const { upperFirstLetter } = require('../lib/display-helper')
const { getOrganisationDetails } = require('./models/organisation-details')
const { getApplicationDetails } = require('./models/application-details')
const { getHistoryDetails } = require('./models/application-history')
const { getApplicationClaimDetails } = require('./models/application-claim')

module.exports = {
  method: 'get',
  path: '/view-agreement/{reference}',
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    validate: {
      params: joi.object({
        reference: joi.string()
      }),
      query: joi.object({
        page: joi.number().greater(0).default(1),
        errors: joi.string().allow(null),
        withdraw: joi.bool().default(false),
        moveToInCheck: joi.bool().default(false),
        recommendToPay: joi.bool().default(false),
        recommendToReject: joi.bool().default(false),
        approve: joi.bool().default(false),
        reject: joi.bool().default(false),
        updateStatus: joi.bool().default(false)
      })
    },
    handler: async (request, h) => {
      const { page } = request.query
      const application = await getApplication(request.params.reference, request.logger)
      const applicationHistory = await getApplicationHistory(request.params.reference, request.logger)
      const currentStatusEvent = getCurrentStatusEvent(application, applicationHistory)

      let applicationEvents
      if ((application.claimed ||
      application.statusId === applicationStatus.inCheck ||
      application.statusId === applicationStatus.readyToPay ||
      application.statusId === applicationStatus.rejected) &&
      !application.data.dateOfClaim) {
        applicationEvents = await getApplicationEvents(application?.data?.organisation.sbi, request.logger)
      }

      const status = application.status.status.toUpperCase()
      const statusLabel = upperFirstLetter(application.status.status.toLowerCase())
      const statusClass = getStyleClassByStatus(application.status.status)

      const {
        withdrawAction,
        withdrawForm,
        moveToInCheckAction,
        moveToInCheckForm,
        recommendAction,
        recommendToPayForm,
        recommendToRejectForm,
        authoriseAction,
        authoriseForm,
        rejectAction,
        rejectForm,
        updateStatusForm
      } = getClaimViewStates(request, application.statusId, currentStatusEvent)

      const statusOptions = Object.entries(claimStatuses)
        .map(([key, value]) => ({
          text: upperFirstLetter(key).replace(/_/, ' '),
          value,
          selected: value === application.statusId
        }))

      const errors = request.query.errors
        ? JSON.parse(Buffer.from(request.query.errors, 'base64').toString('utf8'))
        : []

      const { isAdministrator } = mapAuth(request)
      const actions = isAdministrator
        ? {
            items: [{
              href: `/view-agreement/${application.reference}?updateStatus=true&page=${page}#update-status`,
              text: 'Change',
              visuallyHiddenText: 'status'
            }]
          }
        : null

      const statusRow = {
        key: { text: 'Status' },
        value: { html: `<span class="govuk-tag app-long-tag ${statusClass}">${statusLabel}</span>` },
        actions
      }

      const contactHistory = await getContactHistory(request.params.reference, request.logger)
      const contactHistoryDetails = displayContactHistory(contactHistory)
      const { organisation } = application.data
      const organisationDetails = getOrganisationDetails(organisation, contactHistoryDetails)
      const applicationDetails = getApplicationDetails(application, statusRow)
      const historyDetails = getHistoryDetails(applicationHistory)
      const applicationClaimDetails = getApplicationClaimDetails(application, applicationEvents, statusRow)
      const errorMessages = getErrorMessagesByKey(errors)

      return h.view('view-agreement', {
        page,
        reference: application.reference,
        claimOrAgreement: 'agreement',
        status,
        statusLabel,
        statusClass,
        organisationName: application.data.organisation.name,
        vetVisit: application.vetVisit,
        claimed: application.claimed,
        payment: application.payment,
        organisationDetails,
        applicationDetails,
        historyDetails,
        applicationClaimDetails,
        contactPerson: currentStatusEvent?.ChangedBy,
        withdrawAction,
        withdrawForm,
        moveToInCheckAction,
        moveToInCheckForm,
        recommendAction,
        recommendToPayForm,
        recommendToRejectForm,
        authoriseAction,
        authoriseForm,
        rejectAction,
        rejectForm,
        updateStatusForm,
        statusOptions,
        errorMessages,
        errors
      })
    }
  }
}
