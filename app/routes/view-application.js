const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../api/applications')
const { administrator, processor, user } = require('../auth/permissions')
const speciesNumbers = require('../../app/constants/species-numbers')
const eligibleSpecies = require('../../app/constants/eligible-species')
const { formatedDateToUk, upperFirstLetter } = require('../lib/display-helper')
const getStyleClassByStatus = require('../constants/status')
const { getYesNoRadios } = require('./helpers/yes-no-radios')
const { viewApplication: { fraudCheck, payment } } = require('../session/keys')
const session = require('../session')
const head = [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }]
const { autoPayment } = require('../config')
const labelText = 'Approve fraud check'
const labelTextPayment = 'Approve payment'

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

const getVetVisitData = (vetVisit, species) => {
  const { data, createdAt } = vetVisit
  const formatedDate = formatedDateToUk(createdAt)
  const rows = []
  rows.push(
    [{ text: formatedDate }, { text: 'Review date' }, { text: formatedDateToUk(data.visitDate) }],
    [{ text: formatedDate }, { text: eligibleSpecies[species] }, { text: upperFirstLetter(data.eligibleSpecies) }]
  )

  if (data.speciesBvdInHerd) {
    rows.push([{ text: formatedDate }, { text: 'BVD in herd?' }, { text: upperFirstLetter(data.speciesBvdInHerd) }])
  }

  if (data.speciesTest && species === 'pigs') {
    rows.push([{ text: formatedDate }, { text: 'PRRS in herd?' }, { text: upperFirstLetter(data.speciesTest) }])
  }

  if (data.speciesVaccinated) {
    rows.push([{ text: formatedDate }, { text: 'Species Vaccinated?' }, { text: upperFirstLetter(data.speciesVaccinated) }])
  }

  if (data.speciesLastVaccinated) {
    rows.push([{ text: formatedDate }, { text: 'Last Vaccinated?' }, { text: `${data.speciesLastVaccinated.month}-${data.speciesLastVaccinated.year}` }])
  }

  if (data.speciesVaccinationUpToDate) {
    rows.push([{ text: formatedDate }, { text: 'Vaccination up to date?' }, { text: upperFirstLetter(data.speciesVaccinationUpToDate) }])
  }

  if (data.sheepWorms) {
    rows.push([{ text: formatedDate }, { text: 'Worms in sheep?' }, { text: upperFirstLetter(data.sheepWorms) }])
  }

  rows.push([{ text: formatedDate }, { text: 'Report given?' }, { text: upperFirstLetter(data.reviewReport) }])

  return {
    head,
    rows
  }
}

const getPaymentData = (paymentData) => {
  const { data, createdAt } = paymentData
  const formatedDate = formatedDateToUk(createdAt)
  const rows = []
  data.invoiceLines.forEach(invoiceLine => {
    rows.push([{ text: formatedDate }, { text: invoiceLine.description }, { text: `£${data?.value?.toFixed(2)}` }])
  })

  if (data.frn) {
    rows.push([{ text: formatedDate }, { text: 'FRN number' }, { text: data.frn }])
  }

  if (data.invoiceNumber) {
    rows.push([{ text: formatedDate }, { text: 'Invoice number' }, { text: data.invoiceNumber }])
  }

  return {
    head,
    rows
  }
}

const getClaimData = (updatedAt) => {
  const formatedDate = formatedDateToUk(updatedAt)
  return {
    head,
    rows: [
      [{ text: formatedDate }, { text: 'Details correct?' }, { text: 'Yes' }]
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
      const application = await getApplication(request.params.reference)
      if (!application) {
        throw boom.badRequest()
      }

      const statusClass = getStyleClassByStatus(application.status.status)
      const fraudCheckPassed = session.getApplicationFraudCheck(request, fraudCheck + request.params.reference) || false
      const paymentPaid = session.getApplicationPayment(request, payment + request.params.reference) || false
      const paymentRadio = getYesNoRadios(labelTextPayment, payment, paymentPaid, null, { inline: true }).radios
      return h.view('view-application', {
        autoPayment,
        applicationId: application.reference,
        status: application.status.status,
        statusClass,
        organisationName: application?.data?.organisation?.name,
        applicationData: getFarmerApplication(application),
        listData: { rows: getOrganisationRows(application?.data?.organisation) },
        vetVisit: application?.vetVisit,
        vetVisitData: application?.vetVisit ? getVetVisitData(application.vetVisit, application?.data?.whichReview) : false,
        claimed: application?.claimed,
        claimData: application?.claimed ? getClaimData(application?.updatedAt) : false,
        payment: application?.payment,
        paymentData: application?.payment ? getPaymentData(application?.payment) : false,
        ...getYesNoRadios(labelText, fraudCheck, fraudCheckPassed, null, { inline: true }),
        paymentRadio,
        fraudCheckPassed,
        paymentPaid
      })
    }
  }
}
