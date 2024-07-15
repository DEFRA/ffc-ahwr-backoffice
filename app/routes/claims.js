const crumbCache = require('./utils/crumb-cache')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')
const { getClaims } = require('../api/claims')
const { formatedDateToUk, formatTypeOfVisit, formatSpecies, formatStatusId } = require('../lib/display-helper')
const { getClaimSort } = require('../session')
const { claimSort } = require('../session/keys')
const { getStyleClassByStatus } = require('../constants/status')
const { serviceUri } = require('../config')

const pageUrl = '/claims'

module.exports = [{
  method: 'GET',
  path: pageUrl,
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    handler: async (request, h) => {
      await crumbCache.generateNewCrumb(request, h)
      const { claims } = await getClaims()
      const sortField = getClaimSort(request, claimSort.sort) ?? undefined
      const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'
      const claimTableHeader = [{
        text: 'Claim number',
        attributes: {
          'aria-sort': sortField && sortField.field === 'claim number' ? direction : 'none',
          'data-url': `/application/${request.params.reference}/claims/sort/claim number`
        }
      },
      {
        text: 'Type of visit',
        attributes: {
          'aria-sort': sortField && sortField.field === 'type of visit' ? direction : 'none',
          'data-url': `/application/${request.params.reference}/claims/sort/type of visit`
        }
      },
      {
        text: 'Species',
        attributes: {
          'aria-sort': sortField && sortField.field === 'species' ? direction : 'none',
          'data-url': `/application/${request.params.reference}/claims/sort/species`
        }
      },
      {
        text: 'Claim date',
        attributes: {
          'aria-sort': sortField && sortField.field === 'claim date' ? direction : 'none',
          'data-url': `/application/${request.params.reference}/claims/sort/claim date`
        },
        format: 'date'
      },
      {
        text: 'Status',
        attributes: {
          'aria-sort': sortField && sortField.field === 'status' ? direction : 'none',
          'data-url': `/application/${request.params.reference}/claims/sort/status`
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
          { html: `<a href="${serviceUri}/view-claim/${claim.reference}?returnPage=claims">View details</a>` }
        ]
      })

      return h.view('claims', {
        claimTable: claimTableClaims
          ? {
              header: claimTableHeader,
              claims: claimTableClaims
            }
          : undefined
      })
    }
  }
}]
