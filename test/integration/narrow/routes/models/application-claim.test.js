const { getApplicationClaimDetails } = require('../../../../../app/routes/models/application-claim')
const viewApplicationData = require('../../../../data/view-applications.json')
const applicationEventData = require('../../../../data/application-events.json')

describe('Application-claim model', () => {
  test('getClaimData - Valid Data with date of claim in application data', async () => {
    const res = getApplicationClaimDetails(viewApplicationData.claim, [], 'statusRow')

    expect(res).toEqual([
      'statusRow',
      { key: { text: 'Date of review' }, value: { text: '07/11/2022' } },
      { key: { text: 'Date of testing' }, value: { text: '08/11/2022' } },
      { key: { text: 'Date of claim' }, value: { text: '09/11/2022' } },
      { key: { text: 'Review details confirmed' }, value: { text: 'Yes' } },
      { key: { text: 'Vet’s name' }, value: { text: 'testVet' } },
      { key: { text: 'Vet’s RCVS number' }, value: { text: '1234234' } },
      {
        key: { text: 'Test results unique reference number (URN)' },
        value: { text: '134242' }
      }
    ])
  })

  test('getClaimData - Valid Data with date of claim in events data', async () => {
    const res = getApplicationClaimDetails(viewApplicationData.claimWithNoClaimDate, applicationEventData, 'statusRow')

    expect(res).toEqual([
      'statusRow',
      { key: { text: 'Date of review' }, value: { text: '07/11/2022' } },
      { key: { text: 'Date of testing' }, value: { text: '08/11/2022' } },
      { key: { text: 'Date of claim' }, value: { text: '09/11/2022' } },
      { key: { text: 'Review details confirmed' }, value: { text: 'Yes' } },
      { key: { text: 'Vet’s name' }, value: { text: 'testVet' } },
      { key: { text: 'Vet’s RCVS number' }, value: { text: '1234234' } },
      {
        key: { text: 'Test results unique reference number (URN)' },
        value: { text: '134242' }
      }
    ])
  })

  test('getClaimData - Valid Data with no date of claim', async () => {
    const res = getApplicationClaimDetails(viewApplicationData.claimWithNoClaimDate, [], 'statusRow')
    expect(res).toEqual([
      'statusRow',
      { key: { text: 'Date of review' }, value: { text: '07/11/2022' } },
      { key: { text: 'Date of testing' }, value: { text: '08/11/2022' } },
      { key: { text: 'Date of claim' }, value: { text: '' } },
      { key: { text: 'Review details confirmed' }, value: { text: 'Yes' } },
      { key: { text: 'Vet’s name' }, value: { text: 'testVet' } },
      { key: { text: 'Vet’s RCVS number' }, value: { text: '1234234' } },
      {
        key: { text: 'Test results unique reference number (URN)' },
        value: { text: '134242' }
      }
    ])
  })

  test('getClaimData - Valid Data with no date of testing', async () => {
    const res = getApplicationClaimDetails(viewApplicationData.claimWithNoDateOfTesting, [], 'statusRow')

    expect(res).toEqual([
      'statusRow',
      { key: { text: 'Date of review' }, value: { text: '07/11/2022' } },
      { key: { text: 'Date of testing' }, value: { text: 'Invalid Date' } },
      { key: { text: 'Date of claim' }, value: { text: '' } },
      { key: { text: 'Review details confirmed' }, value: { text: 'Yes' } },
      { key: { text: 'Vet’s name' }, value: { text: 'testVet' } },
      { key: { text: 'Vet’s RCVS number' }, value: { text: '1234234' } },
      {
        key: { text: 'Test results unique reference number (URN)' },
        value: { text: '134242' }
      }
    ])
  })

  test('getClaimData - Valid Data with no claim-claimed event', async () => {
    const res = getApplicationClaimDetails(viewApplicationData.claimWithNoClaimDate, {
      eventRecords: [
        {
          EventRaised: '2022-11-09T11:00:00.000Z',
          EventType: 'claim-createdBy'
        }
      ]
    }, 'statusRow')

    expect(res).toEqual([
      'statusRow',
      { key: { text: 'Date of review' }, value: { text: '07/11/2022' } },
      { key: { text: 'Date of testing' }, value: { text: '08/11/2022' } },
      { key: { text: 'Date of claim' }, value: { text: '' } },
      { key: { text: 'Review details confirmed' }, value: { text: 'Yes' } },
      { key: { text: 'Vet’s name' }, value: { text: 'testVet' } },
      { key: { text: 'Vet’s RCVS number' }, value: { text: '1234234' } },
      {
        key: { text: 'Test results unique reference number (URN)' },
        value: { text: '134242' }
      }
    ])
  })
})
