const { getApplications } = require('../../api/applications')
const { getPagination, getPagingData } = require('../../pagination')
const { getAppSearch } = require('../../session')
const { getStyleClassByStatus } = require('../../constants/status')
const keys = require('../../session/keys')
const { serviceUri, endemics } = require('../../config')
const { upperFirstLetter } = require('../../lib/display-helper')

const viewModel = (request, page) => {
  return (async () => {
    return { model: await createModel(request, page) }
  })()
}

const getApplicationTableHeader = (sortField) => {
  const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'
  let agreementDateTitle = 'Apply date'
  let headerColumns = [{
    text: 'Agreement number'
  },
  {
    text: 'Organisation'
  }]

  if (endemics.enabled) {
    agreementDateTitle = 'Agreement date'
    headerColumns = [{
      text: 'Agreement number',
      attributes: {
        'aria-sort': sortField && sortField.field === 'Reference' ? direction : 'none',
        'data-url': '/agreements/sort/Reference'
      }
    },
    {
      text: 'Organisation',
      attributes: {
        'aria-sort': sortField && sortField.field === 'Organisation' ? direction : 'none',
        'data-url': '/agreements/sort/Organisation'
      }
    }]
  }

  headerColumns.push({
    text: 'SBI number',
    attributes: {
      'aria-sort': sortField && sortField.field === 'SBI' ? direction : 'none',
      'data-url': '/agreements/sort/SBI'
    },
    format: 'numeric'
  })
  headerColumns.push({
    text: agreementDateTitle,
    attributes: {
      'aria-sort': sortField && sortField.field === 'Apply date' ? direction : 'none',
      'data-url': '/agreements/sort/Apply date'
    },
    format: 'date'
  })
  headerColumns.push({
    text: 'Status',
    attributes: {
      'aria-sort': sortField && sortField.field === 'Status' ? direction : 'none',
      'data-url': '/agreements/sort/Status'
    }
  })
  headerColumns.push({
    text: 'Details'
  })

  return headerColumns
}

async function createModel (request, page) {
  const viewTemplate = 'agreements'
  const currentPath = `/${viewTemplate}`
  page = page ?? request.query.page ?? 1
  const { limit, offset } = getPagination(page)
  const searchText = getAppSearch(request, keys.appSearch.searchText)
  const searchType = getAppSearch(request, keys.appSearch.searchType)
  const filterStatus = getAppSearch(request, keys.appSearch.filterStatus) ?? []
  const sortField = getAppSearch(request, keys.appSearch.sort) ?? undefined
  const apps = await getApplications(searchType, searchText, limit, offset, filterStatus, sortField, request.logger)

  if (apps.total > 0) {
    let statusClass
    const applications = apps.applications.map(n => {
      statusClass = getStyleClassByStatus(n.status.status)
      const output = [
        {
          text: n.reference
        },
        {
          text: n.data?.organisation?.name
        },
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
          html: `<span class="app-long-tag"><span class="govuk-tag ${statusClass}">${upperFirstLetter(n.status.status.toLowerCase())}</span></span>`,
          attributes: {
            'data-sort-value': `${n.status.status}`
          }
        },
        { html: `<a href="${serviceUri}/view-agreements/${n.reference}?page=${page}">View details</a>` }
      ]

      if (endemics.enabled) {
        output[0].attributes = { 'data-sort-value': `${n.reference}` }
        output[1].attributes = { 'data-sort-value': `${n.data?.organisation?.name}` }
        output[5] = {
          html: n.type === 'EE'
            ? `<a href="${serviceUri}/agreement/${n.reference}/claims?page=${page}">View claims</a>`
            : `<a href="${serviceUri}/view-agreement/${n.reference}?page=${page}">View details</a>`
        }
      }

      return output
    })
    const pagingData = getPagingData(apps.total ?? 0, limit, request.query)
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
      error: 'No agreements found.',
      searchText,
      availableStatus: [],
      selectedStatus: [],
      filterStatus: []
    }
  }
}

module.exports = { viewModel, getApplicationTableHeader, createModel }
