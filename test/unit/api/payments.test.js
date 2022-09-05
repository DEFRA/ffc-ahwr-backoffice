const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { paymentApiUri } = require('../../../app/config')
const appRef = 'ABC-1234'
const { getPayments, postPayment } = require('../../../app/api/payments')
describe('Payment API', () => {
  it('Post Payments should return empty payments array', async () => {
    jest.mock('@hapi/wreck')
    const wreckResponse = {
      payload: {
        payments: [],
        total: 0
      },
      res: {
        statusCode: 502
      }
    }
    const payload = {}
    const options = {
      payload,
      json: true
    }
    Wreck.post = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await postPayment(payload)
    expect(response).not.toBeNull()
    expect(response.payments).toStrictEqual([])
    expect(response.total).toStrictEqual(0)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
    expect(Wreck.post).toHaveBeenCalledWith(`${paymentApiUri}/payment`, options)
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
    const response = await getPayments(appRef)
    expect(response).toBeNull()
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${paymentApiUri}/payment/${appRef}`, options)
  })

  it('GetPayments should return valid Payments array', async () => {
    jest.mock('@hapi/wreck')
    const wreckResponse = {
      payload: {
        payments: [{
        }],
        total: 1
      },
      res: {
        statusCode: 200
      }
    }
    const options = {
      json: true
    }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getPayments(appRef)
    expect(response).not.toBeNull()
    expect(response.payments).toStrictEqual([{}])
    expect(response.total).toStrictEqual(1)
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${paymentApiUri}/payment/${appRef}`, options)
  })
  it('GetPayment should not return null', async () => {
    jest.mock('@hapi/wreck')
    const PaymentData = {
      reference: appRef
    }
    const wreckResponse = {
      payload: PaymentData,
      res: {
        statusCode: 200
      }
    }
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getPayments(appRef)
    expect(response).not.toBeNull()
    expect(response).toBe(PaymentData)
    expect(response.reference).toBe(appRef)
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${paymentApiUri}/payment/${appRef}`, options)
  })

  it('GetPayments should return empty Payments array if api not available', async () => {
    jest.mock('@hapi/wreck')
    const payload = {
    }
    const options = {
      payload,
      json: true
    }
    Wreck.post = jest.fn(async function (_url, _options) {
      throw new Error('fakeError')
    })
    const response = await postPayment(payload)
    expect(response).not.toBeNull()
    expect(response.payments).toStrictEqual([])
    expect(response.total).toStrictEqual(0)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
    expect(Wreck.post).toHaveBeenCalledWith(`${paymentApiUri}/payment`, options)
  })
  it('GetPayments should return null if api not available', async () => {
    jest.mock('@hapi/wreck')
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      throw (new Error('fakeError'))
    })
    const response = await getPayments(appRef)
    expect(response).toBeNull()
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${paymentApiUri}/payment/${appRef}`, options)
  })
})
