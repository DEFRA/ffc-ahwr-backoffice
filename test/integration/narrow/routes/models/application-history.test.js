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
  test('getHistoryData - Invalid Data', async () => {
    const res = getHistoryData({ historyRecords: null })
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')
    expect(res.rows).toBe(undefined)
  })
  test.each([
    { statusId: 1, expectedStatus: 'Agreement agreed' },
    { statusId: 2, expectedStatus: 'Withdraw completed' },
    { statusId: 3, expectedStatus: 'Data inputted' },
    { statusId: 4, expectedStatus: 'Claimed' },
    { statusId: 5, expectedStatus: 'Claim in check' },
    { statusId: 6, expectedStatus: 'Agreement accepted' },
    { statusId: 7, expectedStatus: 'Agreement not agreed' },
    { statusId: 8, expectedStatus: 'Claim paid' },
    { statusId: 9, expectedStatus: 'Claim approved' },
    { statusId: 10, expectedStatus: 'Claim rejected' }
  ])('getHistoryData - Valid status field', async ({ statusId, expectedStatus }) => {
    const applicationHistoryData = {
      historyRecords: [
        {
          date: '23/03/2023',
          time: '10:00:12',
          statusId: statusId,
          user: 'Daniel Jones'
        }
      ]
    }
    const res = getHistoryData(applicationHistoryData)
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')
    expect(res.rows.length).toEqual(1)
    expect(res.rows[0][0].text).toEqual('23/03/2023')
    expect(res.rows[0][1].text).toEqual('10:00:12')
    expect(res.rows[0][2].text).toEqual(expectedStatus)
    expect(res.rows[0][3].text).toEqual('Daniel Jones')
  })
})
