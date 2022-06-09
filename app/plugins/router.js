const routes = [].concat(
  require('../routes/assets'),
  require('../routes/accessibility'),
  require('../routes/cookies'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/home'),
  require('../routes/applications'),
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
