const { getApplications } = require('../../api/applications')
const { getPagination, getPagingData } = require('../../pagination')
const { getAppSearch } = require('../../session')
const getStyleClassByStatus = require('../../constants/status')
const keys = require('../../session/keys')
const { serviceUri } = require('../../config')

class ViewModel {
  constructor (request, page) {
    return (async () => {
      this.model = await createModel(request, page)
      return this
    })()
  }
}

const getApplicationTableHeader = (sortField) => {
  const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'
  const headerColumns = [{
    text: 'Agreement number'
  },
  {
    text: 'Organisation'
  }]
  headerColumns.push({
    text: 'SBI number',
    attributes: {
      'aria-sort': sortField && sortField.field === 'SBI' ? direction : 'none',
      'data-url': '/applications/sort/SBI'
    },
    format: 'numeric'
  })
  headerColumns.push({
    text: 'Apply date',
    attributes: {
      'aria-sort': sortField && sortField.field === 'Apply date' ? direction : 'none',
      'data-url': '/applications/sort/Apply date'
    },
    format: 'date'
  })
  headerColumns.push({
    text: 'Status',
    attributes: {
      'aria-sort': sortField && sortField.field === 'Status' ? direction : 'none',
      'data-url': '/applications/sort/Status'
    }
  })
  headerColumns.push({
    text: 'Details'
  })

  return headerColumns
}

async function createModel (request, page) {
  const viewTemplate = 'applications'
  const currentPath = `/${viewTemplate}`
  page = page ?? request.query.page ?? 1
  const { limit, offset } = getPagination(page)
  const path = request.headers.path ?? ''
  const searchText = getAppSearch(request, keys.appSearch.searchText)
  const searchType = getAppSearch(request, keys.appSearch.searchType)
  const filterStatus = getAppSearch(request, keys.appSearch.filterStatus) ?? []
  const sortField = getAppSearch(request, keys.appSearch.sort) ?? undefined
  const apps = await getApplications(searchType, searchText, limit, offset, filterStatus, sortField)
  if (apps.total > 0) {
    let statusClass
    const applications = apps.applications.map(n => {
      n.status.status = n.status.status === 'APPLIED' ? 'AGREED' : n.status.status
      statusClass = getStyleClassByStatus(n.status.status)
      return [
        { text: n.reference },
        { text: n.data?.organisation?.name },
        {
          text: n.data?.organisation?.sbi,
          format: 'numeric',
          attributes: {
            'data-sort-value': n.data?.organisation?.sbi
          }
        },
        {
          text: new Date(n.createdAt).toLocaleDateString('en-GB'),
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
        { html: `<a href="${serviceUri}/view-application/${n.reference}?page=${page}">View details</a>` }
      ]
    })
    const pagingData = getPagingData(apps.total ?? 0, limit, page, path)
    const groupByStatus = apps.applicationStatus.map(s => {
      return {
        status: s.status,
        total: s.total,
        styleClass: getStyleClassByStatus(s.status),
        selected: filterStatus.filter(f => f === s.status).length > 0
      }
    })
    return {
      applications,
      header: getApplicationTableHeader(getAppSearch(request, keys.appSearch.sort)),
      ...pagingData,
      searchText,
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
      applications: [],
      error: 'No Applications found.',
      searchText,
      availableStatus: [],
      selectedStatus: [],
      filterStatus: []
    }
  }
}

module.exports = { ViewModel, getApplicationTableHeader }
