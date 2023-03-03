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
  test.each([
    { statusId: 0 },
    { statusId: 1 },
    { statusId: 3 },
    { statusId: 4 },
    { statusId: 5 },
    { statusId: 6 },
    { statusId: 7 },
    { statusId: 8 }
  ])('getHistoryData - Invalid status field', async ({ statusId }) => {
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
    expect(res.rows.length).toBe(0)
  })
  test('getHistoryData - Return correct rows', async () => {
    const applicationHistoryData = {
      historyRecords: [
        {
          date: '23/03/2023',
          time: '10:00:12',
          statusId: 1,
          user: 'Test Person 1'
        },
        {
          date: '24/03/2023',
          time: '11:00:12',
          statusId: 2,
          user: 'Test Person 2'
        },
        {
          date: '25/03/2023',
          time: '12:00:12',
          statusId: 3,
          user: 'Test Person 3'
        },
        {
          date: '26/03/2023',
          time: '13:00:12',
          statusId: 9,
          user: 'Test Person 4'
        }
      ]
    }
    const res = getHistoryData(applicationHistoryData)
    expect(res).not.toBeNull()
    expect(res.header[0].text).toEqual('Date')
    expect(res.header[1].text).toEqual('Time')
    expect(res.header[2].text).toEqual('Action')
    expect(res.header[3].text).toEqual('User')
    expect(res.rows.length).toEqual(2)
    expect(res.rows[0][0].text).toEqual('24/03/2023')
    expect(res.rows[0][1].text).toEqual('11:00:12')
    expect(res.rows[0][2].text).toEqual('Withdraw completed')
    expect(res.rows[0][3].text).toEqual('Test Person 2')
    expect(res.rows[1][0].text).toEqual('26/03/2023')
    expect(res.rows[1][1].text).toEqual('13:00:12')
    expect(res.rows[1][2].text).toEqual('Claim approved')
    expect(res.rows[1][3].text).toEqual('Test Person 4')
  })
})
