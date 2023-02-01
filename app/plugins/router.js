const routes = [].concat(
  require('../routes/accessibility'),
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
