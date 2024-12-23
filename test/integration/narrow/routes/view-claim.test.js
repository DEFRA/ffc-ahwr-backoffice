const cheerio = require('cheerio')
const { getClaim } = require('../../../../app/api/claims')
const { administrator } = require('../../../../app/auth/permissions')
const {
  getApplication,
  getApplicationHistory
} = require('../../../../app/api/applications')

jest.mock('../../../../app/auth')
jest.mock('../../../../app/session')
jest.mock('../../../../app/api/claims')
jest.mock('../../../../app/api/applications')
jest.mock('@hapi/wreck', () => ({
  get: jest.fn().mockResolvedValue({ payload: [] })
}))

describe('View claim test', () => {
  const url = '/view-claim'
  const auth = {
    strategy: 'session-auth',
    credentials: { scope: [administrator], account: 'test user' }
  }
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
        name: 'Test Farm Lodge',
        email: 'russelldaviese@seivadllessurm.com.test',
        orgEmail: 'orgEmail@gmail.com',
        address:
          'Tesco Stores Ltd,Harwell,Betton,WHITE HOUSE FARM,VINCENT CLOSE,LEIGHTON BUZZARD,HR2 8AN,United Kingdom',
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

    test('returns 200 with review claim type and Pigs species', async () => {
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
        { key: 'Agreement number', value: 'AHWR-1234-APP1' },
        { key: 'Agreement date', value: '22/03/2024' },
        { key: 'Agreement holder', value: 'Test Farm Lodge' },
        { key: 'Agreement holder email', value: 'russelldaviese@seivadllessurm.com.test' },
        { key: 'SBI number', value: '113494460' },
        { key: 'Address', value: 'Tesco Stores Ltd,Harwell,Betton,WHITE HOUSE FARM,VINCENT CLOSE,LEIGHTON BUZZARD,HR2 8AN,United Kingdom' },
        { key: 'Business email', value: 'orgEmail@gmail.com' },
        { key: 'Status', value: 'Paid' },
        { key: 'Claim date', value: '25/03/2024' },
        { key: 'Business name', value: 'Test Farm Lodge' },
        { key: 'Livestock', value: 'Pigs' },
        { key: 'Type of visit', value: 'Animal health and welfare review' },
        { key: 'Date of visit', value: '22/03/2024' },
        { key: 'Date of sampling', value: '22/03/2024' },
        { key: '51 or more pigs', value: 'Yes' },
        { key: 'Number of oral fluid samples taken', value: '6' },
        { key: "Vet's name", value: 'Vet one' },
        { key: "Vet's RCVS number", value: '1233211' },
        { key: 'Number of animals tested', value: '40' },
        { key: 'URN', value: '123456' }
      ]
      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(20)
      // Application summury detailes expects
      for (let i = 0; i < 6; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(
          content[i].key
        )
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(
          content[i].value
        )
      }
      // Claim summury detailes expects
      for (let i = 6; i < 20; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(
          content[i].key
        )
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(
          content[i].value
        )
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

      const content = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        { key: 'Status', value: 'Recommended to pay' },
        { key: 'Claim date', value: '20/03/2024' },
        { key: 'Business name', value: 'Test Farm Lodge' },
        { key: 'Livestock', value: 'Sheep' },
        { key: 'Type of visit', value: 'Endemic disease follow-ups' },
        { key: 'Date of visit', value: '22/03/2024' },
        { key: 'Date of sampling', value: '22/03/2024' },
        { key: '21 or more sheep', value: 'Yes' },
        { key: "Vet's name", value: '12312312312sdfsdf' },
        { key: "Vet's RCVS number", value: '1233211' },
        { key: 'URN', value: '123456' },
        { key: 'Number of animals tested', value: '40' },
        { key: 'Sheep health package', value: 'Lameness' },
        {
          key: 'Disease or condition test result',
          value: 'Heel or toe abscess (Clinical symptoms present)'
        },
        { key: '', value: 'Shelly hoof (Clinical symptoms not present)' },
        { key: '', value: 'Tick pyaemia (Clinical symptoms present)' },
        { key: '', value: 'yyyyy (123) bbbb (ccc)' }
      ]

      // Summary list rows expect
      expect($('.govuk-summary-list__row').length).toEqual(24)
      // Claim summury detailes expects
      for (let i = 7; i < 24; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(
          content[i].key
        )
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(
          content[i].value
        )
      }
    })
    test.each([
      { type: 'R', rows: 7 },
      { type: undefined, rows: 7 }
    ])('returns 200 whitout claim data', async ({ type, rows }) => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444`,
        auth
      }

      getClaim.mockReturnValue({ ...claims[0], data: undefined, type })
      getApplication.mockReturnValue({
        ...application,
        data: { ...application.data, organisation: undefined }
      })

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)

      // Summary list rows expect to show only application data or if type is provided show application data and type of review
      expect($('.govuk-summary-list__row').length).toEqual(rows)
    })
    test('returns 200 whitout claim data', async () => {
      const encodedErrors =
        'W3sidGV4dCI6IlNlbGVjdCBib3RoIGNoZWNrYm94ZXMiLCJocmVmIjoiI3JlamVjdC1jbGFpbS1wYW5lbCJ9XQ%3D%3D'
      const auth = {
        strategy: 'session-auth',
        credentials: { scope: [administrator], account: 'test user' }
      }
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444?errors=${encodedErrors}`,
        auth
      }

      getClaim.mockReturnValue({
        ...claims[0],
        statusId: 5,
        data: undefined,
        type: 'R'
      })
      getApplication.mockReturnValue({
        ...application,
        data: { ...application.data, organisation: undefined }
      })

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)

      expect($('.govuk-summary-list__row').length).toEqual(7)
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
      expect($('.govuk-summary-list__row').length).toEqual(24)
      // Claim summury detailes expects
      const content = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        { key: 'Herd vaccination status', value: 'Vaccinated' },
        { key: 'URN', value: '123456' },
        { key: 'Samples tested', value: '6' },
        { key: 'Disease status category', value: '4' },
        {
          key: 'Biosecurity assessment',
          value: 'Yes, Assessment percentage: 100%'
        }
      ]
      for (let i = 19; i < 24; i++) {
        expect($('.govuk-summary-list__key').eq(i).text()).toMatch(
          content[i].key
        )
        expect($('.govuk-summary-list__value').eq(i).text()).toMatch(
          content[i].value
        )
      }
    })

    test('the back link should go to agreement details if the user is coming from agreement details page', async () => {
      const options = {
        method: 'GET',
        url: `${url}/AHWR-0000-4444?returnPage=view-agreement`,
        auth
      }

      getClaim.mockReturnValue(claims[0])
      getApplication.mockReturnValue(application)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      expect($('.govuk-back-link').attr('href')).toEqual('/agreement/AHWR-1234-APP1/claims')
    })
    test('the back link should go to all claims main tab if the user is coming from all claims main tab', async () => {
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
      expect($('.govuk-back-link').attr('href')).toEqual('/claims?page=1')
    })
  })
})
