const getHistoryData = require('../../../../../app/routes/models/application-history')
const applicationHistoryData = require('../../../../data/application-history.json')

describe('Application-history model test', () => {
  test('getHistoryData - Valid Data', async () => {
    const res = getHistoryData(applicationHistoryData)
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')
    expect(res.rows.length).toEqual(3)
    expect(res.rows[0][0].text).toEqual('23/03/2023')
    expect(res.rows[0][1].text).toEqual('10:00:12')
    expect(res.rows[0][2].text).toEqual('Claim approved')
    expect(res.rows[0][3].text).toEqual('Daniel Jones')
    expect(res.rows[1][0].text).toEqual('24/03/2023')
    expect(res.rows[1][1].text).toEqual('09:30:00')
    expect(res.rows[1][2].text).toEqual('Withdraw completed')
    expect(res.rows[1][3].text).toEqual('Daniel Jones')
    expect(res.rows[2][0].text).toEqual('25/03/2023')
    expect(res.rows[2][1].text).toEqual('11:10:15')
    expect(res.rows[2][2].text).toEqual('Claim rejected')
    expect(res.rows[2][3].text).toEqual('Amanda Hassan')
  })
  test('getHistoryData - Null Data', async () => {
    const res = getHistoryData({ historyRecords: null })
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')
    expect(res.rows.length).toBe(0)
  })
  test('getHistoryData - Invalid Date Time', async () => {
    const data = applicationHistoryData
    data.historyRecords[0].ChangedOn = null
    data.historyRecords[2].ChangedOn = null
    const res = getHistoryData(data)
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')
    expect(res.rows.length).toEqual(3)
    expect(res.rows[0][0].text).toEqual('')
    expect(res.rows[0][1].text).toEqual('')
    expect(res.rows[0][2].text).toEqual('Claim approved')
    expect(res.rows[0][3].text).toEqual('Daniel Jones')
    expect(res.rows[1][0].text).toEqual('')
    expect(res.rows[1][1].text).toEqual('')
    expect(res.rows[1][2].text).toEqual('Claim rejected')
    expect(res.rows[1][3].text).toEqual('Amanda Hassan')
    expect(res.rows[2][0].text).toEqual('24/03/2023')
    expect(res.rows[2][1].text).toEqual('09:30:00')
    expect(res.rows[2][2].text).toEqual('Withdraw completed')
    expect(res.rows[2][3].text).toEqual('Daniel Jones')
  })
  test.each([
    { statusId: 0 },
    { statusId: 1 },
    { statusId: 3 },
    { statusId: 4 },
    { statusId: 5 },
    { statusId: 6 },
    { statusId: 7 },
    { statusId: 8 }
  ])('getHistoryData - Invalid status field %s', async ({ statusId }) => {
    const applicationHistoryData = {
      historyRecords: [
        {
          ChangedOn: '2023-03-30T20:00:15.000Z',
          Payload: `{\n  "reference": "AHWR-1C5B-568I",\n  "statusId": ${statusId}\n}`,
          ChangedBy: 'Daniel Jones'
        }
      ]
    }
    const res = getHistoryData(applicationHistoryData)
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')
    expect(res.rows.length).toBe(0)
  })

  test('getHistoryData - Return correct rows', async () => {
    const applicationHistoryData = {
      historyRecords: [
        {
          ChangedOn: '2023-03-23T10:00:12.000Z',
          Payload: '{\n  "reference": "AHWR-7C72-8871",\n  "statusId": 1\n}',
          ChangedBy: 'Test Person 1'
        },
        {
          ChangedOn: '2023-03-24T11:00:12.000Z',
          Payload: '{\n  "reference": "AHWR-7C72-8871",\n  "statusId": 2\n}',
          ChangedBy: 'Test Person 2'
        },
        {
          ChangedOn: '2023-03-253T12:00:12.000Z',
          Payload: '{\n  "reference": "AHWR-7C72-8871",\n  "statusId": 3\n}',
          ChangedBy: 'Test Person 3'
        },
        {
          ChangedOn: '2023-03-26T13:00:12.000Z',
          Payload: '{\n  "reference": "AHWR-7C72-8871",\n  "statusId": 9\n}',
          ChangedBy: 'Test Person 4'
        },
        {
          ChangedOn: '2023-03-27T17:00:17.000Z',
          Payload: '{\n  "reference": "AHWR-1C5B-568I",\n  "statusId": 5\n, "subStatus": "Recommend to reject"}',
          ChangedBy: 'Recommender'
        },
        {
          ChangedOn: '2023-03-28T18:00:18.000Z',
          Payload: '{\n  "reference": "AHWR-1C5B-568I",\n  "statusId": 10\n, "subStatus": "Authorise to reject"}',
          ChangedBy: 'Authoriser'
        },
        {
          ChangedOn: '2023-03-29T19:00:19.000Z',
          Payload: '{\n  "reference": "AHWR-1C5B-568I",\n  "statusId": 5\n, "subStatus": "Recommend to pay"}',
          ChangedBy: 'Recommender'
        },
        {
          ChangedOn: '2023-03-30T20:00:15.000Z',
          Payload: '{\n  "reference": "AHWR-1C5B-568I",\n  "statusId": 5\n}',
          ChangedBy: 'admin'
        },
        {
          ChangedOn: '2023-03-30T20:00:20.000Z',
          Payload: '{\n  "reference": "AHWR-1C5B-568I",\n  "statusId": 5\n, "subStatus": "Authorise to pay"}',
          ChangedBy: 'Authoriser'
        }
      ]
    }
    const res = getHistoryData(applicationHistoryData)
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')

    expect(res.rows.length).toEqual(6)

    expect(res.rows[0][0].text).toEqual('24/03/2023')
    expect(res.rows[0][1].text).toEqual('11:00:12')
    expect(res.rows[0][2].text).toEqual('Withdraw completed')
    expect(res.rows[0][3].text).toEqual('Test Person 2')

    expect(res.rows[1][0].text).toEqual('26/03/2023')
    expect(res.rows[1][1].text).toEqual('13:00:12')
    expect(res.rows[1][2].text).toEqual('Claim approved')
    expect(res.rows[1][3].text).toEqual('Test Person 4')

    expect(res.rows[2][0].text).toEqual('27/03/2023')
    expect(res.rows[2][1].text).toEqual('17:00:17')
    expect(res.rows[2][2].text).toEqual('Recommend to reject')
    expect(res.rows[2][3].text).toEqual('Recommender')

    expect(res.rows[3][0].text).toEqual('28/03/2023')
    expect(res.rows[3][1].text).toEqual('18:00:18')
    expect(res.rows[3][2].text).toEqual('Authorise to reject')
    expect(res.rows[3][3].text).toEqual('Authoriser')

    expect(res.rows[4][0].text).toEqual('29/03/2023')
    expect(res.rows[4][1].text).toEqual('19:00:19')
    expect(res.rows[4][2].text).toEqual('Recommend to pay')
    expect(res.rows[4][3].text).toEqual('Recommender')

    expect(res.rows[5][0].text).toEqual('30/03/2023')
    expect(res.rows[5][1].text).toEqual('20:00:20')
    expect(res.rows[5][2].text).toEqual('Authorise to pay')
    expect(res.rows[5][3].text).toEqual('Authoriser')
  })
})
