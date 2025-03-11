const { getRows } = require('./models/account')

module.exports = {
  method: 'GET',
  path: '/account',
  options: {
    handler: async (request, h) => {
      return h.view('account', { rows: getRows(request) })
    }
  }
}
