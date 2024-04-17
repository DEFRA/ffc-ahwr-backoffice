const Wreck = require('@hapi/wreck')
const claims = require('../../data/claims.json')
const { status } = require('../../../app/constants/status')
const { getClaim, getClaims, updateClaimStatus } = require('../../../app/api/claims')

jest.mock('@hapi/wreck')
jest.mock('../../../app/config')

describe('Claims API', () => {
  const claimReference = 'AHWR-1111-1111'
  const applicationReference = 'AHWR-1234-APP1'

  test.each([
    { payload: claims[0], statusCode: 200 },
    { payload: null, statusCode: 404 },
    { payload: null, statusCode: 500 }
  ])('getClaim with $payload and $statusCode', async ({ payload, statusCode }) => {
    const wreckResponse = {
      payload,
      res: {
        statusCode
      },
      json: true
    }

    Wreck.get = jest.fn(async function (_url, _options) {
      return statusCode === 500 ? null : wreckResponse
    })

    const response = await getClaim(claimReference)

    expect(response).toEqual(payload)
  })
  test.each([
    { payload: claims, statusCode: 200 },
    { payload: null, statusCode: 404 },
    { payload: null, statusCode: 500 }
  ])('getClaim with $payload and $statusCode', async ({ payload, statusCode }) => {
    const wreckResponse = {
      payload,
      res: {
        statusCode
      },
      json: true
    }

    Wreck.get = jest.fn(async function (_url, _options) {
      return statusCode === 500 ? null : wreckResponse
    })

    const response = await getClaims(applicationReference)

    expect(response).toEqual(payload)
  })
  test.each([
    { payload: claims[0], statusCode: 200 },
    { payload: null, statusCode: 404 },
    { payload: null, statusCode: 500 }
  ])('getClaim with $payload and $statusCode', async ({ payload, statusCode }) => {
    const wreckResponse = {
      payload,
      res: {
        statusCode
      },
      json: true
    }

    Wreck.put = jest.fn(async function (_url, _options) {
      return statusCode === 500 ? null : wreckResponse
    })

    const response = await updateClaimStatus(applicationReference, 'Admin', status.IN_CHECK)

    expect(response).toEqual(!!payload)
  })
})
