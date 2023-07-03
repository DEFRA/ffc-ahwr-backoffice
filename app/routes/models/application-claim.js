const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')

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
        formatedDate = formatedDateToUk(filteredEvents[0].EventRaised)
      }
    }
  }

  return {
    firstCellIsHeader: true,
    rows: [
      [{ text: 'Date of claim' }, { text: formatedDate }],
      [{ text: 'Review details confirmed' }, { text: upperFirstLetter(data?.confirmCheckDetails) }],
      [{ text: 'Date of review' }, { text: formatedDateToUk(data?.visitDate) }],
      [{ text: 'Vet’s name' }, { text: data?.vetName }],
      [{ text: 'Vet’s RCVS number' }, { text: data?.vetRcvs }],
      [{ text: 'Test results unique reference number (URN)' }, { text: data?.urnResult }]
    ]
  }
}
