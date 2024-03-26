const cheerio = require('cheerio')
const { getClaim } = require('../../../../app/api/claims')
const { administrator } = require('../../../../app/auth/permissions')
const { getApplication } = require('../../../../app/api/applications')

jest.mock('../../../../app/api/claims')
jest.mock('../../../../app/api/applications')

describe('View claim test', () => {
  const url = '/view-claim'
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: 'test user' } }
  const application = {
    id: '787b407f-29da-4d75-889f-1c614d47e87e',
    reference: 'AHWR-1234-APP1',
    data: {
      type: 'EE',
      reference: null,
      declaration: true,
      offerStatus: 'accepted',
      organisation: {
        sbi: '113494460',
        name: 'Mrs S Clark',
        email: 'russelldaviese@seivadllessurm.com.test',
        orgEmail: 'orgEmail@gmail.com',
        address: 'Tesco Stores Ltd,Harwell,Betton,WHITE HOUSE FARM,VINCENT CLOSE,LEIGHTON BUZZARD,HR2 8AN,United Kingdom',
        userType: 'newUser',
        farmerName: 'Russell Paul Davies'
      },
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2024-03-22T12:19:04.696Z',
    updatedAt: '2024-03-22T12:19:04.696Z',
    createdBy: 'sql query',
    updatedBy: null,
    statusId: 1,
    type: 'EE',
    status: { status: 'AGREED' }
  }
  const claims = [
    {
      id: '58b297c9-c983-475c-8bdb-db5746899cec',
      reference: 'AHWR-1111-6666',
      applicationReference: 'AHWR-1234-APP1',
      data: {
        typeOfLivestock: 'pigs',
        vetsName: 'Vet one',
        dateOfVisit: '2024-03-22T00:00:00.000Z',
        dateOfTesting: '2024-03-22T00:00:00.000Z',
        vetRCVSNumber: '1233211',
        laboratoryURN: '123456',
        speciesNumbers: 'yes',
        numberOfOralFluidSamples: '6',
        numberAnimalsTested: '40',
        testResults: 'positive'
      },
      statusId: 8,
      type: 'R',
      createdAt: '2024-03-25T12:20:18.307Z',
      updatedAt: '2024-03-25T12:20:18.307Z',
      createdBy: 'sql query',
      updatedBy: null,
      status: { status: 'PAID' }
    },
    {
      id: '5e8558ee-31d7-454b-a061-b8c97bb91d56',
      reference: 'AHWR-0000-4444',
      applicationReference: 'AHWR-1234-APP1',
      data: {
        vetsName: '12312312312sdfsdf',
        dateOfVisit: '2024-03-22T00:00:00.000Z',
        dateOfTesting: '2024-03-22T00:00:00.000Z',
        vetRCVSNumber: '1233211',
        speciesNumbers: 'yes',
        typeOfLivestock: 'sheep',
        laboratoryURN: '123456',
        numberAnimalsTested: '40',
        sheepEndemicsPackage: 'reducedLameness',
        testResults: [
          {
            result: 'clinicalSymptomsPresent',
            diseaseType: 'heelOrToeAbscess'
          },
          {
            result: 'clinicalSymptomsNotPresent',
            diseaseType: 'shellyHoof'
          },
          {
            result: 'clinicalSymptomsPresent',
            diseaseType: 'tickPyaemia'
          },
          {
            result: [
              {
                testResult: '123',
                diseaseType: 'yyyyy'
              },
              {
                testResult: 'ccc',
                diseaseType: 'bbbb'
              }
            ],
            diseaseType: 'other'
          }
        ]
      },
      statusId: 12,
      type: 'E',
      createdAt: '2024-03-20T12:20:18.307Z',
      updatedAt: '2024-03-20T12:20:18.307Z',
      createdBy: 'sql query',
      updatedBy: null,
      status: { status: 'Recommended to Pay' }
    },
    {
      id: '58b297c9-c983-475c-8bdb-db5746899cec',
      reference: 'AHWR-1111-6666',
      applicationReference: 'AHWR-1234-APP1',
      data: {
        vetsName: '12312312312sdfsdf',
        biosecurity: {
          biosecurity: 'yes',
          assessmentPercentage: '100'
        },
        dateOfVisit: '2024-03-22T00:00:00.000Z',
        dateOfTesting: '2024-03-22T00:00:00.000Z',
        vetRCVSNumber: '1233211',
        speciesNumbers: 'yes',
        typeOfLivestock: 'pigs',
        numberOfSamplesTested: '6',
        numberAnimalsTested: '40',
        herdVaccinationStatus: 'vaccinated',
        diseaseStatus: '4',
        laboratoryURN: '123456',
        reviewTestResults: 'positive',
        vetVisitsReviewTestResults: 'positive'
      },
      statusId: 8,
      type: 'E',
      createdAt: '2024-03-25T12:20:18.307Z',
      updatedAt: '2024-03-25T12:20:18.307Z',
      createdBy: 'sql query',
      updatedBy: null,
      status: { status: 'PAID' }
    },
    {
      id: '58b297c9-c983-475c-8bdb-db5746899cec',
      reference: 'AHWR-1111-6666',
      applicationReference: 'AHWR-1234-APP1',
      data: {
        vetsName: '12312312312sdfsdf',
        biosecurity: 'no',
        dateOfVisit: '2024-03-22T00:00:00.000Z',
        dateOfTesting: '2024-03-22T00:00:00.000Z',
        vetRCVSNumber: '1233211',
        speciesNumbers: 'yes',
        typeOfLivestock: 'beef',
        numberOfSamplesTested: '6',
        numberAnimalsTested: '40',
        laboratoryURN: '123456',
        vetVisitsReviewTestResults: 'positive',
        testResults: 'positive',
        reviewTestResults: 'positive'
      },
      statusId: 8,
      type: 'E',
      createdAt: '2024-03-25T12:20:18.307Z',
      updatedAt: '2024-03-25T12:20:18.307Z',
      createdBy: 'sql query',
      updatedBy: null,
      status: { status: 'PAID' }
    }
  ]

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method: 'GET',
        url: `${url}/123`
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test('returns 400  withouth claim', async () => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue(undefined)
      getApplication.mockReturnValue(application)

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
    })
    test('returns 400  withouth application', async () => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue(claims[0])
      getApplication.mockReturnValue(undefined)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
    })
    test('returns 200 wit review claim type and Pigs species', async () => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue(claims[0])
      getApplication.mockReturnValue(application)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(17)
      // Application summury detailes expects
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Russell Paul Davies')
      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('113494460')
      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Tesco Stores Ltd,Harwell,Betton,WHITE HOUSE FARM,VINCENT CLOSE,LEIGHTON BUZZARD,HR2 8AN,United Kingdom')
      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('russelldaviese@seivadllessurm.com.test')
      expect($('.govuk-summary-list__key').eq(4).text()).toMatch('Organisation email address')
      expect($('.govuk-summary-list__value').eq(4).text()).toMatch('orgEmail@gmail.com')
      // Claim summury detailes expects
      expect($('.govuk-summary-list__key').eq(5).text()).toMatch('Business name')
      expect($('.govuk-summary-list__value').eq(5).text()).toMatch('Mrs S Clark')
      expect($('.govuk-summary-list__key').eq(6).text()).toMatch('Livestock')
      expect($('.govuk-summary-list__value').eq(6).text()).toMatch('Pigs')
      expect($('.govuk-summary-list__key').eq(7).text()).toMatch('Type of review')
      expect($('.govuk-summary-list__value').eq(7).text()).toMatch('Annual health and welfare review')
      expect($('.govuk-summary-list__key').eq(8).text()).toMatch('Date of visit')
      expect($('.govuk-summary-list__value').eq(8).text()).toMatch('22 March 2024')
      expect($('.govuk-summary-list__key').eq(9).text()).toMatch('Date of testing')
      expect($('.govuk-summary-list__value').eq(9).text()).toMatch('22 March 2024')
      expect($('.govuk-summary-list__key').eq(10).text()).toMatch('51 or more pigs')
      expect($('.govuk-summary-list__value').eq(10).text()).toMatch('Yes')
      expect($('.govuk-summary-list__key').eq(11).text()).toMatch("Vet's name")
      expect($('.govuk-summary-list__value').eq(11).text()).toMatch('Vet one')
      expect($('.govuk-summary-list__key').eq(12).text()).toMatch("Vet's RCVS number")
      expect($('.govuk-summary-list__value').eq(12).text()).toMatch('1233211')
      expect($('.govuk-summary-list__key').eq(13).text()).toMatch('Test results URN')
      expect($('.govuk-summary-list__value').eq(13).text()).toMatch('123456')
      expect($('.govuk-summary-list__key').eq(14).text()).toMatch('Number of tests')
      expect($('.govuk-summary-list__value').eq(14).text()).toMatch('6')
      expect($('.govuk-summary-list__key').eq(15).text()).toMatch('Number of animals tested')
      expect($('.govuk-summary-list__value').eq(15).text()).toMatch('40')
      expect($('.govuk-summary-list__key').eq(16).text()).toMatch('Test result')
      expect($('.govuk-summary-list__value').eq(16).text()).toMatch('Positive')
    })
    test('returns 200 with endemics claim and sheep species', async () => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue(claims[1])
      getApplication.mockReturnValue(application)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(20)
      // Claim summury detailes expects
      expect($('.govuk-summary-list__key').eq(5).text()).toMatch('Business name')
      expect($('.govuk-summary-list__value').eq(5).text()).toMatch('Mrs S Clark')
      expect($('.govuk-summary-list__key').eq(6).text()).toMatch('Livestock')
      expect($('.govuk-summary-list__value').eq(6).text()).toMatch('Sheep')
      expect($('.govuk-summary-list__key').eq(7).text()).toMatch('Type of review')
      expect($('.govuk-summary-list__value').eq(7).text()).toMatch('Endemic disease follow-ups')
      expect($('.govuk-summary-list__key').eq(8).text()).toMatch('Date of visit')
      expect($('.govuk-summary-list__value').eq(8).text()).toMatch('22 March 2024')
      expect($('.govuk-summary-list__key').eq(9).text()).toMatch('Date of testing')
      expect($('.govuk-summary-list__value').eq(9).text()).toMatch('22 March 2024')
      expect($('.govuk-summary-list__key').eq(10).text()).toMatch('21 or more sheep')
      expect($('.govuk-summary-list__value').eq(10).text()).toMatch('Yes')
      expect($('.govuk-summary-list__key').eq(11).text()).toMatch("Vet's name")
      expect($('.govuk-summary-list__value').eq(11).text()).toMatch('12312312312sdfsdf')
      expect($('.govuk-summary-list__key').eq(12).text()).toMatch("Vet's RCVS number")
      expect($('.govuk-summary-list__value').eq(12).text()).toMatch('1233211')
      expect($('.govuk-summary-list__key').eq(13).text()).toMatch('Test results URN')
      expect($('.govuk-summary-list__value').eq(13).text()).toMatch('123456')
      expect($('.govuk-summary-list__key').eq(14).text()).toMatch('Number of animals tested')
      expect($('.govuk-summary-list__value').eq(14).text()).toMatch('40')
      expect($('.govuk-summary-list__key').eq(15).text()).toMatch('Endemics package')
      expect($('.govuk-summary-list__value').eq(15).text()).toMatch('ReducedLameness')
      expect($('.govuk-summary-list__key').eq(16).text()).toMatch('Disease test and result')
      expect($('.govuk-summary-list__value').eq(16).text()).toMatch('Heel or toe abscess (Clinical symptoms present)')
      expect($('.govuk-summary-list__key').eq(17).text()).toMatch('')
      expect($('.govuk-summary-list__value').eq(17).text()).toMatch('Shelly hoof (Clinical symptoms not present)')
      expect($('.govuk-summary-list__key').eq(18).text()).toMatch('')
      expect($('.govuk-summary-list__value').eq(18).text()).toMatch('Tick pyaemia (Clinical symptoms present)')
      expect($('.govuk-summary-list__key').eq(19).text()).toMatch('')
      expect($('.govuk-summary-list__value').eq(19).text()).toMatch('yyyyy (123) bbbb (ccc)')
    })
    test.each([
      { type: 'R', rows: 6 },
      { type: undefined, rows: 5 }
    ])('returns 200 whitout claim data', async ({ type, rows }) => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue({ ...claims[0], data: undefined, type })
      getApplication.mockReturnValue({ ...application, data: { ...application.data, organisation: undefined } })

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)

      // Summary list rows expect to show only application data or if type is provided show application data and type of review
      expect($('.govuk-summary-list__row').length).toEqual(rows)
    })
    test('returns 200 with endemics claim and pigs species', async () => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue(claims[2])
      getApplication.mockReturnValue(application)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(21)
      // Claim summury detailes expects
      expect($('.govuk-summary-list__key').eq(15).text()).toMatch('Review test result')
      expect($('.govuk-summary-list__value').eq(15).text()).toMatch('Positive')
      expect($('.govuk-summary-list__key').eq(16).text()).toMatch('Vet Visits Review Test results')
      expect($('.govuk-summary-list__value').eq(16).text()).toMatch('Positive')
      expect($('.govuk-summary-list__key').eq(17).text()).toMatch('Diseases status category')
      expect($('.govuk-summary-list__value').eq(17).text()).toMatch('4')
      expect($('.govuk-summary-list__key').eq(18).text()).toMatch('Samples tested')
      expect($('.govuk-summary-list__value').eq(18).text()).toMatch('6')
      expect($('.govuk-summary-list__key').eq(19).text()).toMatch('Herd vaccination status')
      expect($('.govuk-summary-list__value').eq(19).text()).toMatch('Vaccinated')
      expect($('.govuk-summary-list__key').eq(20).text()).toMatch('Biosecurity assessment')
      expect($('.govuk-summary-list__value').eq(20).text()).toMatch('Yes, Assessment percentage: 100%')
    })
    test('returns 200 with auth with beef', async () => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue(claims[3])
      getApplication.mockReturnValue(application)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(20)
      // Claim summury detailes expects
      expect($('.govuk-summary-list__key').eq(15).text()).toMatch('Review test result')
      expect($('.govuk-summary-list__value').eq(15).text()).toMatch('Positive')
      expect($('.govuk-summary-list__key').eq(16).text()).toMatch('Endemics test result')
      expect($('.govuk-summary-list__value').eq(16).text()).toMatch('Positive')
      expect($('.govuk-summary-list__key').eq(17).text()).toMatch('Vet Visits Review Test results')
      expect($('.govuk-summary-list__value').eq(17).text()).toMatch('Positive')
      expect($('.govuk-summary-list__key').eq(19).text()).toMatch('Biosecurity assessment')
      expect($('.govuk-summary-list__value').eq(19).text()).toMatch('No')
    })
  })
})
