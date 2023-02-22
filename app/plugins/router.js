const routes = [].concat(
  require('../routes/accessibility'),
  require('../routes/account'),
  require('../routes/applications'),
  require('../routes/assets'),
  require('../routes/authenticate'),
  require('../routes/dev-auth'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/home'),
  require('../routes/login'),
  require('../routes/logout'),
  require('../routes/privacy-policy'),
  require('../routes/approve-application-claim'),
  require('../routes/reject-application-claim'),
  require('../routes/withdraw-application'),
  require('../routes/view-application')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
