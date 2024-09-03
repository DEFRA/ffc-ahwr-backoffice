const { serviceUri } = require('../../config')
const { getClaims } = require('../../api/claims')
const { getClaimSearch } = require('../../session')
const { claimSearch } = require('../../session/keys')
const checkValidSearch = require('../../lib/search-validation')
const { getStyleClassByStatus } = require('../../constants/status')
const { getPagination, getPagingData } = require('../../pagination')
const { formatTypeOfVisit, formatSpecies, formatedDateToUk } = require('../../lib/display-helper')

const viewModel = (request, page, limit) => {
  return (async () => {
    return { model: await createModel(request, page, limit) }
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

async function createModel (request, page, pageLimit) {
  page = page ?? request.query?.page ?? 1
  const path = request.headers.path ?? ''
  const { limit, offset } = getPagination(page, pageLimit)
  const { searchText, searchType } = checkValidSearch(getClaimSearch(request, claimSearch.searchText))
  const sortField = getClaimSearch(request, claimSearch.sort) ?? undefined
  const claimsData = await getClaims(searchType, searchText, limit, offset, sortField)
  let claims = []
  if (claimsData.total > 0) {
    claims = claimsData.claims.map((claim) => [
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
        text: claim.application.data?.organisation?.sbi,
        format: 'numeric',
        attributes: {
          'data-sort-value': claim.application.data?.organisation?.sbi
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
        html: `<span class="govuk-tag ${getStyleClassByStatus(claim.status.status)}">${claim.status.status.toUpperCase()}</span>`,
        attributes: {
          'data-sort-value': `${claim.status.status}`
        }
      },
      { html: `<a href="${serviceUri}/view-claim/${claim.reference}?returnPage=claims">View claim</a>` }
    ])
    const pagingData = getPagingData(claimsData.total ?? 0, limit, page, path)
    return {
      claims,
      header: getClaimTableHeader(getClaimSearch(request, claimSearch.sort)),
      ...pagingData,
      searchText: getClaimSearch(request, claimSearch.searchText),
      claimsData
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
