const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')
const { parseData } = require('../utils/parse-data')
const config = require('../../config')

module.exports = (application, applicationEvents) => {
  const { data } = application
  let formatedDate = ''

  if (data?.dateOfClaim) {
    formatedDate = formatedDateToUk(data?.dateOfClaim)
  } else {
    let filteredEvents
    if (applicationEvents?.eventRecords) {
      filteredEvents = applicationEvents.eventRecords.filter(event => event.EventType === 'claim-claimed')
      if (filteredEvents.length !== 0) {
        const claimClaimed = parseData(filteredEvents, 'claim-claimed', 'claimed')
        formatedDate = formatedDateToUk(claimClaimed?.raisedOn)
      }
    }
  }

  if (config.dateOfTesting.enabled) {
    let formatedDateOfTesting = ''
    if (data?.dateOfTesting) {
      formatedDateOfTesting = formatedDateToUk(data?.dateOfTesting)
    }

    return {
      firstCellIsHeader: true,
      rows: [
        [{ text: 'Date of review' }, { text: formatedDateToUk(data?.visitDate) }],
        [{ text: 'Date of testing' }, { text: formatedDateOfTesting }],
        [{ text: 'Date of claim' }, { text: formatedDate }],
        [{ text: 'Review details confirmed' }, { text: upperFirstLetter(data?.confirmCheckDetails) }],
        [{ text: 'Vet’s name' }, { text: data?.vetName }],
        [{ text: 'Vet’s RCVS number' }, { text: data?.vetRcvs }],
        [{ text: 'Test results unique reference number (URN)' }, { text: data?.urnResult }]
      ]
    }
  }

  return {
    firstCellIsHeader: true,
    rows: [
      [{ text: 'Date of review' }, { text: formatedDateToUk(data?.visitDate) }],
      [{ text: 'Date of claim' }, { text: formatedDate }],
      [{ text: 'Review details confirmed' }, { text: upperFirstLetter(data?.confirmCheckDetails) }],
      [{ text: 'Vet’s name' }, { text: data?.vetName }],
      [{ text: 'Vet’s RCVS number' }, { text: data?.vetRcvs }],
      [{ text: 'Test results unique reference number (URN)' }, { text: data?.urnResult }]
    ]
  }
}
