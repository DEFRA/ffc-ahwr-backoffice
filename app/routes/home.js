const { administrator, processor, user, recommender, authoriser } = require('../auth/permissions')
module.exports = {
  method: 'GET',
  path: '/',
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    handler: async (_, h) => {
      return h.view('home')
    }
  }
}
