const Joi = require('joi')
const boom = require('@hapi/boom')
const crumbCache = require('./utils/crumb-cache')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')
const { getApplication } = require('../api/applications')
const { getClaims } = require('../api/claims')
const { formatedDateToUk, formatTypeOfVisit, formatSpecies, formatStatusId } = require('../lib/display-helper')
const { getClaimSort, setClaimSort } = require('../session')
const { claimSort } = require('../session/keys')
const { getStyleClassByStatus } = require('../constants/status')
const { serviceUri } = require('../config')
const { getContactHistory, displayContactHistory } = require('../api/contact-history')

const pageUrl = '/claims/{reference}'

module.exports = [{
  method: 'GET',
  path: pageUrl,
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string()
      })
    },
    handler: async (request, h) => {
      await crumbCache.generateNewCrumb(request, h)
      const application = await getApplication(request.params.reference)
      const claims = await getClaims(request.params.reference)
      const contactHistory = await getContactHistory(request.params.reference)
      const contactHistoryDetails = displayContactHistory(contactHistory)
      if (!application) {
        throw boom.badRequest()
      }

      const organisation = application.data?.organisation
      const summaryDetails = [
        { field: 'Name', newValue: organisation?.farmerName, oldValue: contactHistoryDetails.farmerName },
        { field: 'SBI number', newValue: organisation?.sbi, oldValue: null },
        { field: 'Address', newValue: organisation?.address, oldValue: contactHistoryDetails.address },
        { field: 'Email address', newValue: organisation?.email, oldValue: contactHistoryDetails.email },
        { field: 'Organisation email address', newValue: organisation?.orgEmail, oldValue: contactHistoryDetails.orgEmail },
        { field: 'Date of agreement', newValue: formatedDateToUk(application.createdAt), oldValue: null }
      ]

      const applicationSummaryDetails = summaryDetails.filter((row) => row.newValue)

      const sortField = getClaimSort(request, claimSort.sort) ?? undefined
      const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'
      const claimTableHeader = [{
        text: 'Claim number',
        attributes: {
          'aria-sort': sortField && sortField.field === 'claim number' ? direction : 'none',
          'data-url': `/claims/${request.params.reference}/sort/claim number`
        }
      },
      {
        text: 'Type of visit',
        attributes: {
          'aria-sort': sortField && sortField.field === 'type of visit' ? direction : 'none',
          'data-url': `/claims/${request.params.reference}/sort/type of visit`
        }
      },
      {
        text: 'Species',
        attributes: {
          'aria-sort': sortField && sortField.field === 'species' ? direction : 'none',
          'data-url': `/claims/${request.params.reference}/sort/species`
        }
      },
      {
        text: 'Claim date',
        attributes: {
          'aria-sort': sortField && sortField.field === 'claim date' ? direction : 'none',
          'data-url': `/claims/${request.params.reference}/sort/claim date`
        },
        format: 'date'
      },
      {
        text: 'Status',
        attributes: {
          'aria-sort': sortField && sortField.field === 'status' ? direction : 'none',
          'data-url': `/claims/${request.params.reference}/sort/status`
        }
      },
      {
        text: 'Details'
      }]

      const claimTableClaims = claims?.map(claim => {
        return [
          {
            text: claim.reference,
            attributes: {
              'data-sort-value': claim.reference
            }
          },
          {
            text: formatTypeOfVisit(claim.type),
            attributes: {
              'data-sort-value': claim.type
            }
          },
          {
            text: formatSpecies(claim.data?.typeOfLivestock),
            attributes: {
              'data-sort-value': claim.data?.typeOfLivestock
            }
          },
          {
            text: formatedDateToUk(claim.createdAt),
            format: 'date',
            attributes: {
              'data-sort-value': claim.createdAt
            }
          },
          {
            html: `<span class="govuk-tag ${getStyleClassByStatus(formatStatusId(claim.statusId))}">${formatStatusId(claim.statusId)}</span>`,
            attributes: {
              'data-sort-value': `${claim.statusId}`
            }
          },
          { html: `<a href="${serviceUri}/view-claim/${claim.reference}">View details</a>` }
        ]
      })

      return h.view('claims', {
        backLink: '/applications',
        businessName: application.data?.organisation?.name,
        applicationSummaryDetails,
        claimTable: claimTableClaims
          ? {
              header: claimTableHeader,
              claims: claimTableClaims
            }
          : undefined
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
      setClaimSort(request, claimSort.sort, request.params)
      return 1 // NOSONAR
    }
  }
}]
