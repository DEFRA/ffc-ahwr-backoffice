const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { getApplications } = require('../messaging/applications')
const { getPagination, getPagingData } = require('../pagination')
const Joi = require('joi')

async function createModel (request, errorMessage) {
  const { limit, offset } = getPagination(request.query.page, request.query.limit)
  let apps
  if (request.payload) {
    apps = await getApplications(request.payload.searchText ?? '', request.payload.searchType ?? '', limit, offset, request.yar.id)
  } else {
    apps = await getApplications('', '', limit, offset, request.yar.id)
  }
  console.log(apps.total, limit, request.query.page, request.headers.path, 'total app count')
  const pagingData = getPagingData(apps.total ?? 0, limit, request.query.page ?? 1, request.headers.path ?? '')

  let statusClass = 'govuk-tag--grey'; let status = 'Pending'

  return {
    applications: apps.applications.map(n => {
      switch (n.status) {
        case '1':
          statusClass = 'govuk-tag--grey'
          status = 'In Progress'
          break
        case '2':
          statusClass = 'govuk-tag--blue'
          status = 'Submitted'
          break
        case '3':
          statusClass = 'govuk-tag--red'
          status = 'Withdrawn'
          break
        case '4':
          statusClass = 'govuk-tag--red'
          status = 'Deleted'
          break
      }
      return [
        { text: n.reference },
        { text: n.data.organisation.name },
        { text: n.data.organisation.sbi },
        { text: new Date(n.createdAt).toLocaleDateString('en-GB') },
        { text: new Date(n.createdAt).toLocaleDateString('en-GB') },
        { html: `<span class="govuk-tag ${statusClass}">${status}</span>` }
      ]
    }),
    ...pagingData,
    errorMessage
  }
}
module.exports = [
  {
    method: 'GET',
    path: currentPath,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(10)
        })
      },
      handler: async (request, h) => {
        console.log('request')
        return h.view(viewTemplate, await createModel(request, null))
      }
    }
  },
  {
    method: 'POST',
    path: `${currentPath}`,
    handler: (request, h) => {
      console.log(request.payload, 'payload')
      return h.view(viewTemplate, createModel(request, null))
    }
  }
]
