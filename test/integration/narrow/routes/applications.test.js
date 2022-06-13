const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/messaging/applications')

applications.getApplications = jest.fn().mockReturnValue({
  applications: [{
    id: '555afd4c-b095-4ce4-b492-800466b53393',
    reference: 'VV-555A-FD4C',
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }]
})

describe('Applications test', () => {
  const url = '/applications'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('Applications')
      expect($('title').text()).toContain('Applications')
      expectPhaseBanner.ok($)
    })
  })
})
