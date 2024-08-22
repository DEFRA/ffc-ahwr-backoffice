const cheerio = require('cheerio')
const { getClaim } = require('../../../../app/api/claims')
const { administrator } = require('../../../../app/auth/permissions')
const { getApplication, getApplicationHistory } = require('../../../../app/api/applications')

jest.mock('../../../../app/auth')
jest.mock('../../../../app/session')
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
                result: '123',
                diseaseType: 'yyyyy'
              },
              {
                result: 'ccc',
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
  getApplicationHistory.mockReturnValue({ head: [], rows: [] })
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

      const content = [
        { key: 'Name', value: 'Russell Paul Davies' },
        { key: 'SBI number', value: '113494460' },
        { key: 'Address', value: 'Tesco Stores Ltd,Harwell,Betton,WHITE HOUSE FARM,VINCENT CLOSE,LEIGHTON BUZZARD,HR2 8AN,United Kingdom' },
        { key: 'Email address', value: 'russelldaviese@seivadllessurm.com.test' },
        { key: 'Organisation email address', value: 'orgEmail@gmail.com' },
        { key: 'Agreement Number', value: 'AHWR-1234-APP1' },
        { key: 'Business name', value: 'Mrs S Clark' },
        { key: 'Livestock', value: 'Pigs' },
        { key: 'Type of visit', value: 'Animal health and welfare review' },
        { key: 'Date of visit', value: '22/03/2024' },
        { key: 'Date of sampling', value: '22/03/2024' },
        { key: '51 or more pigs', value: 'Yes' },
        { key: "Vet's name", value: 'Vet one' },
        { key: "Vet's RCVS number", value: '1233211' },
        { key: 'URN', value: '123456' },
        { key: 'Number of tests', value: '6' },
        { key: 'Number of animals tested', value: '40' },
        { key: 'Test result', value: 'Positive' }
      ]
      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(18)
      // Application summury detailes expects
      for (let i = 0; i < 6; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(content[i].key)
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(content[i].value)
      }
      // Claim summury detailes expects
      for (let i = 6; i < 18; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(content[i].key)
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(content[i].value)
      }
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

      const content = [null, null, null, null, null, null,
        { key: 'Business name', value: 'Mrs S Clark' },
        { key: 'Livestock', value: 'Sheep' },
        { key: 'Type of visit', value: 'Endemic disease follow-ups' },
        { key: 'Date of visit', value: '22/03/2024' },
        { key: 'Date of sampling', value: '22/03/2024' },
        { key: '21 or more sheep', value: 'Yes' },
        { key: "Vet's name", value: '12312312312sdfsdf' },
        { key: "Vet's RCVS number", value: '1233211' },
        { key: 'URN', value: '123456' },
        { key: 'Number of animals tested', value: '40' },
        { key: 'Endemics package', value: 'ReducedLameness' },
        { key: 'Disease or condition test result', value: 'Heel or toe abscess (Clinical symptoms present)' },
        { key: '', value: 'Shelly hoof (Clinical symptoms not present)' },
        { key: '', value: 'Tick pyaemia (Clinical symptoms present)' },
        { key: '', value: 'yyyyy (123) bbbb (ccc)' }
      ]
      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(21)
      // Claim summury detailes expects
      for (let i = 6; i < 21; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(content[i].key)
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(content[i].value)
      }
    })
    test.each([
      { type: 'R', rows: 6 },
      { type: undefined, rows: 6 }
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
    test('returns 200 whitout claim data', async () => {
      const encodedErrors = 'W3sidGV4dCI6IlNlbGVjdCBib3RoIGNoZWNrYm94ZXMiLCJocmVmIjoiI3JlamVjdC1jbGFpbS1wYW5lbCJ9XQ%3D%3D'
      const auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: 'test user' } }
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444?errors=${encodedErrors}`,
        auth
      }

      getClaim.mockReturnValue({ ...claims[0], statusId: 5, data: undefined, type: 'R' })
      getApplication.mockReturnValue({ ...application, data: { ...application.data, organisation: undefined } })

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)

      expect($('.govuk-summary-list__row').length).toEqual(6)
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
      expect($('.govuk-summary-list__row').length).toEqual(22)
      // Claim summury detailes expects
      const content = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
        { key: 'Review test result', value: 'Positive' },
        { key: 'Vet Visits Review Test results', value: 'Positive' },
        { key: 'Disease status category', value: '4' },
        { key: 'Samples tested', value: '6' },
        { key: 'Herd vaccination status', value: 'Vaccinated' },
        { key: 'Biosecurity assessment', value: 'Yes, Assessment percentage: 100%' }
      ]
      for (let i = 16; i < 22; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(content[i].key)
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(content[i].value)
      }
    })
  })
})
