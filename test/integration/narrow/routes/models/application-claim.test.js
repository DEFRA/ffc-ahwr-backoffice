const getClaimData = require('../../../../../app/routes/models/application-claim')
const viewApplicationData = require('../../../../data/view-applications.json')
const applicationEventData = require('../../../../data/application-events.json')
const config = require('../../../../../app/config')

describe('Application-claim model test', () => {
  beforeAll(() => {
    config.dateOfTesting.enabled = false
  })

  test('getClaimData - Valid Data with date of claim in application data', async () => {
    const res = getClaimData(viewApplicationData.claim, [])
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(6)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of claim')
    expect(res.rows[1][1].text).toEqual('09/11/2022')
    expect(res.rows[2][0].text).toEqual('Review details confirmed')
    expect(res.rows[2][1].text).toEqual('Yes')
    expect(res.rows[3][0].text).toEqual('Vet’s name')
    expect(res.rows[3][1].text).toEqual('testVet')
    expect(res.rows[4][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[4][1].text).toEqual('1234234')
    expect(res.rows[5][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[5][1].text).toEqual('134242')
  })

  test('getClaimData - Valid Data with date of claim in events data', async () => {
    const res = getClaimData(viewApplicationData.claimWithNoClaimDate, applicationEventData)
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(6)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of claim')
    expect(res.rows[1][1].text).toEqual('09/11/2022')
    expect(res.rows[2][0].text).toEqual('Review details confirmed')
    expect(res.rows[2][1].text).toEqual('Yes')
    expect(res.rows[3][0].text).toEqual('Vet’s name')
    expect(res.rows[3][1].text).toEqual('testVet')
    expect(res.rows[4][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[4][1].text).toEqual('1234234')
    expect(res.rows[5][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[5][1].text).toEqual('134242')
  })

  test('getClaimData - Valid Data with no date of claim', async () => {
    const res = getClaimData(viewApplicationData.claimWithNoClaimDate, [])
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(6)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of claim')
    expect(res.rows[1][1].text).toEqual('')
    expect(res.rows[2][0].text).toEqual('Review details confirmed')
    expect(res.rows[2][1].text).toEqual('Yes')
    expect(res.rows[3][0].text).toEqual('Vet’s name')
    expect(res.rows[3][1].text).toEqual('testVet')
    expect(res.rows[4][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[4][1].text).toEqual('1234234')
    expect(res.rows[5][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[5][1].text).toEqual('134242')
  })

  test('getClaimData - Valid Data with no claim-claimed event', async () => {
    const res = getClaimData(viewApplicationData.claimWithNoClaimDate, {
      eventRecords: [
        {
          EventRaised: '2022-11-09T11:00:00.000Z',
          EventType: 'claim-createdBy'
        }
      ]
    })
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(6)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of claim')
    expect(res.rows[1][1].text).toEqual('')
    expect(res.rows[2][0].text).toEqual('Review details confirmed')
    expect(res.rows[2][1].text).toEqual('Yes')
    expect(res.rows[3][0].text).toEqual('Vet’s name')
    expect(res.rows[3][1].text).toEqual('testVet')
    expect(res.rows[4][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[4][1].text).toEqual('1234234')
    expect(res.rows[5][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[5][1].text).toEqual('134242')
  })
})

describe('Application-claim model test when dateOfTesting.enabled is true', () => {
  beforeAll(() => {
    config.dateOfTesting.enabled = true
  })

  test('getClaimData - Valid Data with date of claim in application data (dateOfTestingEnabled=true)', async () => {
    const res = getClaimData(viewApplicationData.claim, [])
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(7)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of testing')
    expect(res.rows[1][1].text).toEqual('08/11/2022')
    expect(res.rows[2][0].text).toEqual('Date of claim')
    expect(res.rows[2][1].text).toEqual('09/11/2022')
    expect(res.rows[3][0].text).toEqual('Review details confirmed')
    expect(res.rows[3][1].text).toEqual('Yes')
    expect(res.rows[4][0].text).toEqual('Vet’s name')
    expect(res.rows[4][1].text).toEqual('testVet')
    expect(res.rows[5][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[5][1].text).toEqual('1234234')
    expect(res.rows[6][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[6][1].text).toEqual('134242')
  })

  test('getClaimData - Valid Data with date of claim in events data (dateOfTestingEnabled=true)', async () => {
    const res = getClaimData(viewApplicationData.claimWithNoClaimDate, applicationEventData)
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(7)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of testing')
    expect(res.rows[1][1].text).toEqual('08/11/2022')
    expect(res.rows[2][0].text).toEqual('Date of claim')
    expect(res.rows[2][1].text).toEqual('09/11/2022')
    expect(res.rows[3][0].text).toEqual('Review details confirmed')
    expect(res.rows[3][1].text).toEqual('Yes')
    expect(res.rows[4][0].text).toEqual('Vet’s name')
    expect(res.rows[4][1].text).toEqual('testVet')
    expect(res.rows[5][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[5][1].text).toEqual('1234234')
    expect(res.rows[6][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[6][1].text).toEqual('134242')
  })

  test('getClaimData - Valid Data with no date of claim (dateOfTestingEnabled=true)', async () => {
    const res = getClaimData(viewApplicationData.claimWithNoClaimDate, [])
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(7)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of testing')
    expect(res.rows[1][1].text).toEqual('08/11/2022')
    expect(res.rows[2][0].text).toEqual('Date of claim')
    expect(res.rows[2][1].text).toEqual('')
    expect(res.rows[3][0].text).toEqual('Review details confirmed')
    expect(res.rows[3][1].text).toEqual('Yes')
    expect(res.rows[4][0].text).toEqual('Vet’s name')
    expect(res.rows[4][1].text).toEqual('testVet')
    expect(res.rows[5][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[5][1].text).toEqual('1234234')
    expect(res.rows[6][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[6][1].text).toEqual('134242')
  })

  test('getClaimData - Valid Data with no claim-claimed event (dateOfTestingEnabled=true)', async () => {
    const res = getClaimData(viewApplicationData.claimWithNoClaimDate, {
      eventRecords: [
        {
          EventRaised: '2022-11-09T11:00:00.000Z',
          EventType: 'claim-createdBy'
        }
      ]
    })
    expect(res).not.toBeNull()
    expect(res.rows.length).toEqual(7)
    expect(res.rows[0][0].text).toEqual('Date of review')
    expect(res.rows[0][1].text).toEqual('07/11/2022')
    expect(res.rows[1][0].text).toEqual('Date of testing')
    expect(res.rows[1][1].text).toEqual('08/11/2022')
    expect(res.rows[2][0].text).toEqual('Date of claim')
    expect(res.rows[2][1].text).toEqual('')
    expect(res.rows[3][0].text).toEqual('Review details confirmed')
    expect(res.rows[3][1].text).toEqual('Yes')
    expect(res.rows[4][0].text).toEqual('Vet’s name')
    expect(res.rows[4][1].text).toEqual('testVet')
    expect(res.rows[5][0].text).toEqual('Vet’s RCVS number')
    expect(res.rows[5][1].text).toEqual('1234234')
    expect(res.rows[6][0].text).toEqual('Test results unique reference number (URN)')
    expect(res.rows[6][1].text).toEqual('134242')
  })
})
