const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../messaging/applications')
const { administrator, processor, user } = require('../auth/permissions')
const speciesNumbers = require('../../app/constants/species-numbers')
const { formatedDateToUk, upperFirstLetter } = require('../lib/display-helper')
const getStyleClassByStatus = require('../constants/status')

const head = [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }]

const getOrganisationRows = (organisation) => {
  return [
    { key: { text: 'SBI number:' }, value: { text: organisation?.sbi } },
    { key: { text: 'Address:' }, value: { text: organisation?.address } },
    { key: { text: 'Email address:' }, value: { text: organisation?.email } }
  ]
}

const getFarmerApplication = (application) => {
  const { data, createdAt } = application
  const formatedDate = formatedDateToUk(createdAt)
  return {
    head,
    rows: [
      [{ text: formatedDate }, { text: 'Detail correct?' }, { text: upperFirstLetter(data.confirmCheckDetails) }],
      [{ text: formatedDate }, { text: 'Review type' }, { text: upperFirstLetter(data.whichReview) }],
      [{ text: formatedDate }, { text: 'Livestock number' }, { text: speciesNumbers[data.whichReview] }],
      [{ text: formatedDate }, { text: 'T&Cs agreed?' }, { text: data.declaration ? 'Yes' : 'No' }]
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
      const application = await getApplication(request.params.reference, request.yar.id)
      if (!application) {
        throw boom.badRequest()
      }
      const statusClass = getStyleClassByStatus(application.status.status)
      return h.view('view-application', {
        applicationId: application.reference,
        status: application.status.status,
        statusClass,
        organisationName: application?.data?.organisation?.name,
        applicationData: getFarmerApplication(application),
        listData: { rows: getOrganisationRows(application?.data?.organisation) },
        vetVisit: application?.vetVisit
      })
    }
  }
}
