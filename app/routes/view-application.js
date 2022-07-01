const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../messaging/applications')
const { administrator, processor, user } = require('../auth/permissions')
const speciesNumbers = require('../../app/constants/species-numbers')

const head = [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }]

const getOrganisationRows = (organisation) => {
  return [
    { key: { text: 'SBI number:' }, value: { text: organisation?.sbi }, actions: { items: [{ href: '#', text: 'Change' }] } },
    { key: { text: 'Address:' }, value: { text: organisation?.address }, actions: { items: [{ href: '#', text: 'Change' }] } },
    { key: { text: 'Email address:' }, value: { text: organisation?.email }, actions: { items: [{ href: '#', text: 'Change' }] } }
  ]
}

const getFarmerApplication = (data) => {
  return {
    head,
    rows: [
      [{ text: data.createdAt }, { text: 'Detail correct?' }, { text: data.confirmCheckDetails }],
      [{ text: data.createdAt }, { text: 'Review type' }, { text: data.whichReview }],
      [{ text: data.createdAt }, { text: 'Lifestock number' }, { text: speciesNumbers[data.whichReview] }],
      [{ text: data.createdAt }, { text: 'T&Cs agreed?' }, { text: data.declaration }]
    ]
  }
}

module.exports = {
  method: 'GET',
  path: '/view-application/{reference}',
  options: {
    auth: { scope: [administrator, processor, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      })
    },
    handler: async (request, h) => {
      const response = await getApplication(request.params.reference, request.yar.id)
      if (!response) {
        throw boom.badRequest()
      }
      const application = response
      console.log(application)
      return h.view('view-application', {
        applicationId: application.reference,
        status: application.status.status,
        organisationName: application?.data?.organisation?.name,
        application: getFarmerApplication(application?.data),
        listData: { rows: getOrganisationRows(application?.data?.organisation) },
        vetVisit: application?.vetVisit
      })
    }
  }
}
