const Joi = require('joi')
const boom = require('@hapi/boom')
const crumbCache = require('./utils/crumb-cache')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')
const { getApplication } = require('../api/applications')
const { formatedDateToUk, formatTypeOfVisit, formatSpecies, formatStatusId, upperFirstLetter } = require('../lib/display-helper')
const { getClaimSearch, setClaimSearch } = require('../session')
const { claimSearch } = require('../session/keys')
const { getStyleClassByStatus } = require('../constants/status')
const { serviceUri } = require('../config')
const { getContactHistory, displayContactHistory } = require('../api/contact-history')
const { getClaims } = require('../api/claims')
const { getClaimTableHeader, getClaimTableRows } = require('./models/claim-list')

const pageUrl = '/agreement/{reference}/claims'
const getBackLink = (page, claimReference, returnPage) => {
  return returnPage === 'view-claim'
    ? `/view-claim/${claimReference}?page=${page}`
    : `/agreements?page=${page}`
}

module.exports = [{
  method: 'GET',
  path: pageUrl,
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string()
      }),
      query: Joi.object({
        page: Joi.string().default(1),
        returnPage: Joi.string(),
        reference: Joi.string()
      })
    },
    handler: async (request, h) => {
      const { page, reference, returnPage } = request.query

      await crumbCache.generateNewCrumb(request, h)
      const application = await getApplication(request.params.reference)
      const contactHistory = await getContactHistory(request.params.reference)
      const contactHistoryDetails = displayContactHistory(contactHistory)
      if (!application) {
        throw boom.badRequest()
      }

      const organisation = application.data?.organisation
      const summaryDetails = [
        { field: 'Agreement number', newValue: request.params.reference, oldValue: null },
        { field: 'Agreement date', newValue: formatedDateToUk(application.createdAt), oldValue: null },
        { field: 'Business name', newValue: organisation?.name, oldValue: null },
        { field: 'Agreement holder email', newValue: organisation?.email, oldValue: contactHistoryDetails.email },
        { field: 'SBI number', newValue: organisation?.sbi, oldValue: null },
        { field: 'Address', newValue: organisation?.address, oldValue: contactHistoryDetails.address },
        { field: 'Business email', newValue: organisation?.orgEmail, oldValue: contactHistoryDetails.orgEmail }
      ]

      const applicationSummaryDetails = summaryDetails.filter((row) => row.newValue)

      const sortField = getClaimSearch(request, claimSearch.sort) ?? undefined
      const showSBI = false
      const dataURLPrefix = `/agreement/${request.params.reference}/`
      const header = getClaimTableHeader(sortField, dataURLPrefix, showSBI)

      const searchText = request.params.reference
      const searchType = 'appRef'
      const filter = undefined
      const limit = 30
      const offset = 0
      const { claims, total } = await getClaims(searchType, searchText, filter, limit, offset, sortField, request.logger)
      const claimReturnPage = 'agreement'
      const rows = getClaimTableRows(claims, page, claimReturnPage, showSBI)

      return h.view('agreement', {
        backLink: getBackLink(page, reference, returnPage),
        businessName: application.data?.organisation?.name,
        applicationSummaryDetails,
        claimsTotal: total,
        header,
        rows
      })
    }
  }
},
{
  method: 'GET',
  path: `${pageUrl}/sort/{field}/{direction}`,
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    validate: {
      params: Joi.object({
        reference: Joi.string(),
        field: Joi.string(),
        direction: Joi.string()
      })
    },
    handler: async (request, h) => {
      request.params.direction = request.params.direction !== 'descending' ? 'DESC' : 'ASC'
      setClaimSearch(request, claimSearch.sort, request.params)
      return 1 // NOSONAR
    }
  }
}]
