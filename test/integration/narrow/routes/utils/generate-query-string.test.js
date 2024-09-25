
const { generateQueryString } = require('../../../../../app/routes/utils/generate-query-string')

describe('generateQueryString', () => {
    it('should generate query string with all attributes in object', () => {
        const query = { test1: 'test1', test2: 'test2', test3: 'test3'}
        const queryString = generateQueryString(query)
        expect(queryString).toEqual('&test1=test1&test2=test2&test3=test3')
      })

      it('should remove attributes from query string if defined', () => {
        const query = { test1: 'test1', test2: 'test2', test3: 'test3'}
        const queryString = generateQueryString(query, ['test2'])
        expect(queryString).toEqual('&test1=test1&test3=test3')
      })

      it('should return empty is query is undefined', () => {
        const queryString = generateQueryString(undefined)
        expect(queryString).toEqual('')
      })
})
