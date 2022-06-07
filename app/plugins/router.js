const routes = [].concat(
  require('../routes/assets'),
  require('../routes/accessibility'),
  require('../routes/privacy-policy'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/applications')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
