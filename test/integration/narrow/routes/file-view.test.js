const cheerio = require('cheerio')
const { administrator } = require('../../../../app/auth/permissions')
const storage = require('../../../../app/lib/storage')

storage.listBlob = jest.fn().mockResolvedValue([{
  name: 'fakeFile.pdf'
}])

describe('File view test', () => {
  const url = '/file-view'
  jest.mock('../../../../app/auth')
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test('returns 200 ', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-fieldset__heading').text()).toContain('Select File to download')
      expect($('.govuk-checkboxes__label').text()).toContain('fakeFile.pdf')
    })
  })
})
