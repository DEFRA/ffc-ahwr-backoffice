const routes = [].concat(
  require('../routes/accessibility'),
  require('../routes/applications'),
  require('../routes/assets'),
  require('../routes/cookies'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/home'),
  require('../routes/privacy-policy'),
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
