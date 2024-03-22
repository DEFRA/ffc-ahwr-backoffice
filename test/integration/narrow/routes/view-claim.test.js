describe('View claim test', () => {
    const url = '/view-claim'

    describe(`GET ${url} route`, () => {
    test('returns 302 no auth', async () => {
        const options = {
          method: 'GET',
          url: `${url}/123`
        }
        const res = await global.__SERVER__.inject(options)
        expect(res.statusCode).toBe(302)
      })
    })
})
