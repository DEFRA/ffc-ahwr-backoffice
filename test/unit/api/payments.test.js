const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { paymentApiUri } = require('../../../app/config')
const appRef = 'ABC-1234'
const { getPayment } = require('../../../app/api/payments')
describe('payment API', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('GetPayment should return null', async () => {
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
    const response = await getPayment(appRef)
    expect(response).toBeNull()
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${paymentApiUri}/payment/${appRef}`, options)
  })

  it('GetPayment should not return null', async () => {
    jest.mock('@hapi/wreck')
    const paymentData = {
      reference: appRef
    }
    const wreckResponse = {
      payload: paymentData,
      res: {
        statusCode: 200
      }
    }
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getPayment(appRef)
    expect(response).not.toBeNull()
    expect(response).toBe(paymentData)
    expect(response.reference).toBe(appRef)
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${paymentApiUri}/payment/${appRef}`, options)
  })

  it('GetPayment should return null if api not available', async () => {
    jest.mock('@hapi/wreck')
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      throw (new Error('fakeError'))
    })
    const response = await getPayment(appRef)
    expect(response).toBeNull()
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${paymentApiUri}/payment/${appRef}`, options)
  })
})
