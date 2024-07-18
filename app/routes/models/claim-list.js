const { serviceUri } = require('../../config')
const { getClaims } = require('../../api/claims')
const { getClaimSort } = require('../../session')
const { claimSort } = require('../../session/keys')
const checkValidSearch = require('../../lib/search-validation')
const { getStyleClassByStatus } = require('../../constants/status')
const { getPagination, getPagingData } = require('../../pagination')
const { formatTypeOfVisit, formatSpecies, formatedDateToUk } = require('../../lib/display-helper')

const viewModel = (request, page) => {
  return (async () => {
    return { model: await createModel(request, page) }
  })()
}

const getClaimTableHeader = (sortField) => {
  const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'

  return [{
    text: 'Claim number',
    attributes: {
      'aria-sort': sortField && sortField.field === 'claim number' ? direction : 'none',
      'data-url': 'claims/sort/claim number'
    }
  },
  {
    text: 'Type of visit',
    attributes: {
      'aria-sort': sortField && sortField.field === 'type of visit' ? direction : 'none',
      'data-url': 'claims/sort/type of visit'
    }
  },
  {
    text: 'SBI number',
    attributes: {
      'aria-sort': sortField && sortField.field === 'SBI' ? direction : 'none',
      'data-url': '/claims/sort/SBI'
    },
    format: 'numeric'
  },
  {
    text: 'Species',
    attributes: {
      'aria-sort': sortField && sortField.field === 'species' ? direction : 'none',
      'data-url': 'claims/sort/species'
    }
  },
  {
    text: 'Claim date',
    attributes: {
      'aria-sort': sortField && sortField.field === 'claim date' ? direction : 'none',
      'data-url': 'claims/sort/claim date'
    },
    format: 'date'
  },
  {
    text: 'Status',
    attributes: {
      'aria-sort': sortField && sortField.field === 'status' ? direction : 'none',
      'data-url': 'claims/sort/status'
    }
  },
  {
    text: 'Details'
  }]
}

async function createModel (request, page) {
  page = page ?? request.query.page ?? 1
  const path = request.headers.path ?? ''
  const { limit, offset } = getPagination(page)
  const { searchText, searchType } = checkValidSearch(request.payload?.searchText)
  const sortField = getClaimSort(request, claimSort.sort) ?? undefined
  const apps = await getClaims(searchType, searchText, limit, offset, sortField)
  if (apps.total > 0) {
    let statusClass
    const claims = apps.claims.map(n => {
      statusClass = getStyleClassByStatus(n.status.status)

      const output = [
        {
          text: n.reference,
          attributes: {
            'data-sort-value': n.reference
          }
        },
        {
          text: formatTypeOfVisit(n.type),
          attributes: {
            'data-sort-value': n.type
          }
        },
        {
          text: n.application.data?.organisation?.sbi,
          format: 'numeric',
          attributes: {
            'data-sort-value': n.application.data?.organisation?.sbi
          }
        },
        {
          text: formatSpecies(n.data?.typeOfLivestock),
          attributes: {
            'data-sort-value': n.data?.typeOfLivestock
          }
        },
        {
          text: formatedDateToUk(n.createdAt),
          format: 'date',
          attributes: {
            'data-sort-value': n.createdAt
          }
        },
        {
          html: `<span class="govuk-tag ${statusClass}">${n.status.status}</span>`,
          attributes: {
            'data-sort-value': `${n.status.status}`
          }
        },
        { html: `<a href="${serviceUri}/view-claim/${n.reference}?returnPage=claims">View claim</a>` }
      ]

      return output
    })
    const pagingData = getPagingData(apps.total ?? 0, limit, page, path)
    return {
      claims,
      header: getClaimTableHeader(getClaimSort(request, claimSort.sort)),
      ...pagingData,
      searchText: request.payload?.searchText
    }
  } else {
    return {
      claims: [],
      error: 'No claims found.',
      searchText
    }
  }
}

module.exports = { viewModel, getClaimTableHeader, createModel }
