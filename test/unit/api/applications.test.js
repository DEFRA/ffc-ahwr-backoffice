const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { applicationApiUri } = require('../../../app/config')
const appRef = 'ABC-1234'
const limit = 20
const offset = 0
let searchText = ''
let searchType = ''
const { getApplications, getApplication, withdrawApplication, processApplicationClaim, getApplicationHistory, getApplicationEvents, updateApplicationStatus } = require('../../../app/api/applications')
describe('Application API', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('GetApplications should return empty applications array', async () => {
    jest.mock('@hapi/wreck')
    const wreckResponse = {
      payload: {
        applications: [],
        total: 0
      },
      res: {
        statusCode: 502
      }
    }
    const options = {
      payload: {
        search: { text: searchText, type: searchType },
        limit,
        offset
      },
      json: true
    }
    Wreck.post = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplications(searchType, searchText, limit, offset)
    expect(response).not.toBeNull()
    expect(response.applications).toStrictEqual([])
    expect(response.total).toStrictEqual(0)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
    expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/application/search`, options)
  })
  it('GetApplication should return null', async () => {
    jest.mock('@hapi/wreck')
    const wreckResponse = {
      payload: null,
      res: {
        statusCode: 502
      }
    }
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplication(appRef)
    expect(response).toBeNull()
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/get/${appRef}`, options)
  })

  it('GetApplications should return valid applications array', async () => {
    jest.mock('@hapi/wreck')
    const wreckResponse = {
      payload: {
        applications: [{

        }],
        total: 1
      },
      res: {
        statusCode: 200
      }
    }
    searchText = '1234567890'
    searchType = 'sbi'
    const options = {
      payload: {
        search: { text: searchText, type: searchType },
        limit,
        offset
      },
      json: true
    }
    Wreck.post = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplications(searchType, searchText, limit, offset)
    expect(response).not.toBeNull()
    expect(response.applications).toStrictEqual([{}])
    expect(response.total).toStrictEqual(1)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
    expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/application/search`, options)
  })
  it('GetApplication should not return null', async () => {
    jest.mock('@hapi/wreck')
    const applicationData = {
      reference: appRef
    }
    const wreckResponse = {
      payload: applicationData,
      res: {
        statusCode: 200
      }
    }
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplication(appRef)
    expect(response).not.toBeNull()
    expect(response).toBe(applicationData)
    expect(response.reference).toBe(appRef)
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/get/${appRef}`, options)
  })

  it('GetApplications should return empty applications array if api not available', async () => {
    jest.mock('@hapi/wreck')
    const options = {
      payload: {
        search: { text: searchText, type: searchType },
        limit,
        offset,
        filter: []
      },
      json: true
    }
    Wreck.post = jest.fn(async function (_url, _options) {
      throw new Error('fakeError')
    })
    const response = await getApplications(searchType, searchText, limit, offset, [])
    expect(response).not.toBeNull()
    expect(response.applications).toStrictEqual([])
    expect(response.total).toStrictEqual(0)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
    expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/application/search`, options)
  })
  it('GetApplication should return null if api not available', async () => {
    jest.mock('@hapi/wreck')
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      throw (new Error('fakeError'))
    })
    const response = await getApplication(appRef)
    expect(response).toBeNull()
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/get/${appRef}`, options)
  })

  it('WithdrawApplication should return false if api not available', async () => {
    jest.mock('@hapi/wreck')
    const options = {
      payload: {
        user: 'test',
        status: 2
      },
      json: true
    }
    Wreck.put = jest.fn(async function (_url, _options) {
      throw (new Error('fakeError'))
    })
    const response = await withdrawApplication(appRef, 'test', 2)
    expect(response).toBe(false)
    expect(Wreck.put).toHaveBeenCalledTimes(1)
    expect(Wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/application/${appRef}`, options)
  })

  it('WithdrawApplication should return true after successful API request', async () => {
    jest.mock('@hapi/wreck')
    const options = {
      payload: {
        user: 'test',
        status: 2
      },
      json: true
    }
    const wreckResponse = {
      res: {
        statusCode: 200
      }
    }

    Wreck.put = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await withdrawApplication(appRef, 'test', 2)
    expect(response).toBe(true)
    expect(Wreck.put).toHaveBeenCalledTimes(1)
    expect(Wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/application/${appRef}`, options)
  })

  it('processApplicationClaim should return false if api not available', async () => {
    jest.mock('@hapi/wreck')
    const options = {
      payload: {
        user: 'test',
        approved: false,
        reference: appRef
      },
      json: true
    }
    Wreck.post = jest.fn(async function (_url, _options) {
      throw (new Error('fakeError'))
    })
    const response = await processApplicationClaim(appRef, 'test', false)
    expect(response).toBe(false)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
    expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/application/claim`, options)
  })

  it('processApplicationClaim should return true after successful API request', async () => {
    jest.mock('@hapi/wreck')
    const options = {
      payload: {
        user: 'test',
        approved: true,
        reference: appRef
      },
      json: true
    }
    const wreckResponse = {
      res: {
        statusCode: 200
      }
    }

    Wreck.post = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await processApplicationClaim(appRef, 'test', true)
    expect(response).toBe(true)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
    expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/application/claim`, options)
  })

  it('updateApplicationStatus should return true after successful API request', async () => {
    jest.mock('@hapi/wreck')
    const options = {
      payload: {
        user: 'test',
        status: 11
      },
      json: true
    }
    const wreckResponse = {
      res: {
        statusCode: 200
      }
    }

    Wreck.put = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await updateApplicationStatus(appRef, 'test', 11)
    expect(response).toBe(true)
    expect(Wreck.put).toHaveBeenCalledTimes(1)
    expect(Wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/application/${appRef}`, options)
  })

  it('GetApplicationHistory should return empty history records array', async () => {
    jest.mock('@hapi/wreck')
    const consoleErrorSpy = jest.spyOn(console, 'error')
    const statusCode = 502
    const statusMessage = 'undefined'
    const wreckResponse = {
      payload: {
        historyRecords: []
      },
      res: {
        statusCode
      }
    }

    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplicationHistory(appRef)
    expect(response).not.toBeNull()
    expect(response.historyRecords).toStrictEqual([])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/history/${appRef}`, options)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Getting application history for ${appRef} failed: HTTP ${statusCode} (${statusMessage})`)
  })

  it('GetApplicationHistory should return valid history records array', async () => {
    jest.mock('@hapi/wreck')
    const wreckResponse = {
      payload: {
        historyRecords: [{

        }]
      },
      res: {
        statusCode: 200
      }
    }

    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplicationHistory(appRef)
    expect(response).not.toBeNull()
    expect(response.historyRecords).toStrictEqual([{}])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/history/${appRef}`, options)
  })

  it('GetApplicationHistory should return empty history records array if api not available', async () => {
    jest.mock('@hapi/wreck')

    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      throw new Error('fakeError')
    })
    const response = await getApplicationHistory(appRef)
    expect(response).not.toBeNull()
    expect(response.historyRecords).toStrictEqual([])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/history/${appRef}`, options)
  })

  it('GetApplicationEvents should return empty records array', async () => {
    jest.mock('@hapi/wreck')
    const consoleErrorSpy = jest.spyOn(console, 'error')
    const statusCode = 502
    const statusMessage = 'undefined'
    const wreckResponse = {
      payload: {
        eventRecords: []
      },
      res: {
        statusCode
      }
    }

    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplicationEvents(appRef)
    expect(response).not.toBeNull()
    expect(response.eventRecords).toStrictEqual([])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/events/${appRef}`, options)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Getting application events for ${appRef} failed: HTTP ${statusCode} (${statusMessage})`)
  })

  it('GetApplicationEvents should return valid records array', async () => {
    jest.mock('@hapi/wreck')
    const wreckResponse = {
      payload: {
        eventRecords: [{

        }]
      },
      res: {
        statusCode: 200
      }
    }

    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplicationEvents(appRef)
    expect(response).not.toBeNull()
    expect(response.eventRecords).toStrictEqual([{}])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/events/${appRef}`, options)
  })

  it('GetApplicationEvents should return empty records array if api not available', async () => {
    jest.mock('@hapi/wreck')

    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      throw new Error('fakeError')
    })
    const response = await getApplicationEvents(appRef)
    expect(response).not.toBeNull()
    expect(response.eventRecords).toStrictEqual([])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/events/${appRef}`, options)
  })
})
