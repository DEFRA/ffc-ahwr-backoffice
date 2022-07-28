const { administrator, processor, user } = require('../auth/permissions')
module.exports = {
  method: 'GET',
  path: '/',
  options: {
    auth: { scope: [administrator, processor, user] },
    handler: async (_, h) => {
      return h.view('home')
    }
  }
}
