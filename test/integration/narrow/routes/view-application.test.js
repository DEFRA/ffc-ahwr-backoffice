const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/messaging/applications')

const reference = 'VV-555A-FD4C'

applications.getApplication = jest.fn().mockReturnValueOnce(null).mockReturnValue({
  applications: [{
    id: '555afd4c-b095-4ce4-b492-800466b53393',
    reference,
    status: { status: 'Submitted' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farms',
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

describe('View Application test', () => {
  const url = `/view-application/${reference}`

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('returns 400', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('400 - Bad Request')
      expectPhaseBanner.ok($)
    })
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual(`Application ${reference} Submitted`)
      expect($('title').text()).toContain(`Application ${reference}`)
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')
      expect($('.govuk-summary-list__actions .govuk-link').eq(0).text()).toMatch('Change')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')
      expect($('.govuk-summary-list__actions .govuk-link').eq(1).text()).toMatch('Change')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')
      expect($('.govuk-summary-list__actions .govuk-link').eq(2).text()).toMatch('Change')
      expectPhaseBanner.ok($)
    })
  })
})
