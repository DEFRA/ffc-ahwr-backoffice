const { createModel } = require('../../../../../app/routes/models/application-list')
const { getApplicationTableHeader } = require('../../../../../app/routes/models/application-list')
const applicationData = require('.././../../../data/applications.json')
const { getApplications } = require('../../../../../app/api/applications')
jest.mock('../../../../../app/api/applications')

describe('Application-list model test', () => {
  test.each([
    { n: 0, field: 'Reference', direction: 'DESC' },
    { n: 0, field: 'Reference', direction: 'ASC' },
    { n: 1, field: 'Organisation', direction: 'DESC' },
    { n: 1, field: 'Organisation', direction: 'ASC' },
    { n: 2, field: 'SBI', direction: 'DESC' },
    { n: 2, field: 'SBI', direction: 'ASC' },
    { n: 3, field: 'Apply date', direction: 'DESC' },
    { n: 3, field: 'Apply date', direction: 'ASC' },
    { n: 4, field: 'Status', direction: 'DESC' },
    { n: 4, field: 'Status', direction: 'ASC' }
  ])('getApplicationTableHeader $field $direction', async ({ n, field, direction }) => {
    const sortField = { field: field, direction: direction }
    const ariaSort = direction === 'DESC' ? 'descending' : 'ascending'
    const res = getApplicationTableHeader(sortField)
    expect(res).not.toBeNull()
    expect(res[n].attributes['aria-sort']).toEqual(ariaSort)
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
