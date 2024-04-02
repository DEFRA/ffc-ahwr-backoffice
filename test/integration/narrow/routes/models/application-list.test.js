const { createModel } = require('../../../../../app/routes/models/application-list')
const { getApplicationTableHeader } = require('../../../../../app/routes/models/application-list')
const applicationData = require('.././../../../data/applications.json')
const { getApplications } = require('../../../../../app/api/applications')
jest.mock('../../../../../app/api/applications')

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

describe('Application-list createModel', () => {
  beforeAll(() => {
    getApplications.mockImplementation(() => applicationData)
  })

  afterAll(() => {
    getApplications.mockClear()
  })

  test('createModel should return view claims when type EE', async () => {
    const result = await createModel({ request: 'a request', headers: { path: 'some path' } }, 1)
    expect(result.applications[0][5].html).toContain('View claims')
  })

  test('createModel should return view details when type is not EE', async () => {
    const result = await createModel({ request: 'a request', headers: { path: 'some path' } }, 1)
    expect(result.applications[1][5].html).toContain('View details')
  })
})
