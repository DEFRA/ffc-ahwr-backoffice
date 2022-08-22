const { getApplicationTableHeader } = require('../../../../../app/routes/models/application-list')
const sessionMock = require('../../../../../app/session')
const applicationData = require('.././../../../data/applications.json')

jest.mock('../../../../../app/session')
const applications = require('../../../../../app/api/applications')
jest.mock('../../../../../app/api/applications')
const pagination = require('../../../../../app/pagination')
jest.mock('../../../../../app/pagination')

pagination.getPagination = jest.fn().mockReturnValue({
  limit: 10, offset: 0
})

pagination.getPagingData = jest.fn().mockReturnValue({
  page: 1, totalPages: 1, total: 1, limit: 10, url: undefined
})
applications.getApplications = jest.fn().mockReturnValue(applicationData)
sessionMock.getAppSearch = jest.fn()
  .mockReturnValue([])
  .mockReturnValueOnce(['PENDING', 'APPLIED', 'DATA INPUTTED', 'CLAIMED'])
  .mockReturnValueOnce({ field: 'SBI', direction: 'DESC' })

describe('Application-list model test', () => {
  test('getApplicationTableHeader SBI DESC', async () => {
    const sortField = { field: 'SBI', direction: 'DESC' }
    const res = getApplicationTableHeader(sortField)
    expect(res).not.toBeNull()
    expect(res[2].attributes['aria-sort']).toEqual('descending')
  })
  test('getApplicationTableHeader SBI ASC', async () => {
    const sortField = { field: 'SBI', direction: 'ASC' }
    const res = getApplicationTableHeader(sortField)
    expect(res).not.toBeNull()
    expect(res[2].attributes['aria-sort']).toEqual('ascending')
  })
  test('getApplicationTableHeader Apply date DESC', async () => {
    const sortField = { field: 'Apply date', direction: 'DESC' }
    const res = getApplicationTableHeader(sortField)
    expect(res).not.toBeNull()
    expect(res[3].attributes['aria-sort']).toEqual('descending')
  })
  test('getApplicationTableHeader Apply date ASC', async () => {
    const sortField = { field: 'Apply date', direction: 'ASC' }
    const res = getApplicationTableHeader(sortField)
    expect(res).not.toBeNull()
    expect(res[3].attributes['aria-sort']).toEqual('ascending')
  })
  test('getApplicationTableHeader Status DESC', async () => {
    const sortField = { field: 'Status', direction: 'DESC' }
    const res = getApplicationTableHeader(sortField)
    expect(res).not.toBeNull()
    expect(res[4].attributes['aria-sort']).toEqual('descending')
  })
  test('getApplicationTableHeader Status ASC', async () => {
    const sortField = { field: 'Status', direction: 'ASC' }
    const res = getApplicationTableHeader(sortField)
    expect(res).not.toBeNull()
    expect(res[4].attributes['aria-sort']).toEqual('ascending')
  })
})
