const { getClaims } = require('../../api/claims')
const { getPagination, getPagingData } = require('../../pagination')
const { getClaimSearch } = require('../../session')
const { getStyleClassByStatus } = require('../../constants/status')
const { claimSearch } = require('../../session/keys')
const { serviceUri } = require('../../config')
const checkValidSearch = require('../../lib/search-validation')
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
  const viewTemplate = 'claims'
  const currentPath = `/${viewTemplate}`
  page = page ?? request.query.page ?? 1
  const { limit, offset } = getPagination(page)
  const path = request.headers.path ?? ''
  const { searchText, searchType } = checkValidSearch(request.payload?.searchText)
  const filterStatus = getClaimSearch(request, claimSearch.filterStatus) ?? []
  const sortField = getClaimSearch(request, claimSearch.sort) ?? undefined
  const apps = await getClaims(searchType, searchText, limit, offset, filterStatus, sortField)
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
    const groupByStatus = apps.claimStatus.map(s => {
      return {
        status: s.status,
        total: s.total,
        styleClass: getStyleClassByStatus(s.status),
        selected: filterStatus.filter(f => f === s.status).length > 0
      }
    })
    return {
      claims,
      header: getClaimTableHeader(getClaimSearch(request, claimSearch.sort)),
      ...pagingData,
      searchText: request.payload?.searchText,
      availableStatus: groupByStatus,
      selectedStatus: groupByStatus.filter(s => s.selected === true).map(s => {
        return {
          href: `${currentPath}/remove/${s.status}`,
          classes: s.styleClass,
          text: s.status
        }
      }),
      filterStatus: groupByStatus.map(s => {
        return {
          value: s.status,
          html: `<div class="govuk-tag ${s.styleClass}"  style="color:#104189;" >${s.status} (${s.total}) </div>`,
          checked: s.selected,
          styleClass: s.styleClass
        }
      })
    }
  } else {
    return {
      claims: [],
      error: 'No claims found.',
      searchText,
      availableStatus: [],
      selectedStatus: [],
      filterStatus: []
    }
  }
}

module.exports = { viewModel, getClaimTableHeader, createModel }
