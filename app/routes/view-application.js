const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../messaging/applications')

const getOrganisationRows = (organisation) => {
  return [
    { key: { text: 'SBI number:' }, value: { text: organisation.sbi }, actions: { items: [ { href: "#", text: "Change" } ] } },
    { key: { text: 'Address:' }, value: { text: organisation.address}, actions: { items: [ { href: "#", text: "Change" } ] } },
    { key: { text: 'Email address:' }, value: { text: organisation.email }, actions: { items: [ { href: "#", text: "Change" } ] } },
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
        const application =  await getApplication(request.params.reference, request.yar.id)
        if (!application) {
          throw boom.badRequest()
        }
        return h.view('view-application', { applicationId: application.reference, organisationName: application?.data?.organisation?.name ,listData: { rows: getOrganisationRows(application?.data?.organisation) } })
      }
    }
  }
}
