const Joi = require('joi')
const Boom = require('@hapi/boom')
const { addStageExecution } = require('../api/stage-execution')
const getUser = require('../auth/get-user')

module.exports = {
  method: 'POST',
  path: '/recommend-to-pay',
  options: {
    validate: {
      payload: Joi.object({
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1),
        confirm: Joi.array().items(Joi.string().valid('checkedAgainstChecklist', 'sentChecklist')).required()
      }),
      failAction: async (request, h, error) => {
        console.log('Backoffice: recommend-to-pay: Error when validating payload: ', error)
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToPay=true&error=true`).takeover()
      }
    },
    handler: async (request, h) => {
      const userName = getUser(request).username
      const response = await addStageExecution({
        applicationReference: request.payload.reference,
        stageConfigurationId: 1,
        executedAt: new Date(),
        executedBy: userName,
        action: {
          action: 'Recommend to pay'
        }
      })
      if (response.length === 0) {
        console.log('Backoffice: recommend-to-pay: Error when adding stage execution entry')
        throw Boom.internal('Error when adding stage execution entry')
      }
      console.log('Backoffice: recommend-to-pay: Stage execution entry added: ', response)
      return h.redirect(`/view-application/${request.payload.reference}?page=${request.payload.page}`)
    }
  }
}
