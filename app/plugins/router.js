const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/applications'),
  require('../routes/org-applications')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
