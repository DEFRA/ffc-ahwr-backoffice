const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../messaging/applications')

const getOrganisationRows = (organisation) => {
  return [
    { key: { text: 'SBI number:' }, value: { text: organisation?.sbi }, actions: { items: [{ href: '#', text: 'Change' }] } },
    { key: { text: 'Address:' }, value: { text: organisation?.address }, actions: { items: [{ href: '#', text: 'Change' }] } },
    { key: { text: 'Email address:' }, value: { text: organisation?.email }, actions: { items: [{ href: '#', text: 'Change' }] } }
  ]
}

module.exports = {
  method: 'GET',
  path: '/view-application/{reference}',
  options: {
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      })
    },
    auth: false,
    handler: async (request, h) => {
      const response = await getApplication(request.params.reference, request.yar.id)
      console.log(response)
      if (!response) {
        throw boom.badRequest()
      }
      const application = response
      return h.view('view-application', { applicationId: application.reference, status: application.status.status, organisationName: application?.data?.organisation?.name, listData: { rows: getOrganisationRows(application?.data?.organisation) } })
    }
  }
}
