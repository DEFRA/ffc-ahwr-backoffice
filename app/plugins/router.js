const routes = [].concat(
  require('../routes/accessibility'),
  require('../routes/account'),
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
  require('../routes/withdraw-agreement'),
  require('../routes/view-agreement'),
  require('../routes/view-claim'),
  require('../routes/agreement'),
  require('../routes/agreements'),
  require('../routes/claims'),
  require('../routes/recommend-to-pay'),
  require('../routes/recommend-to-reject'),
  require('../routes/move-to-in-check'),
  require('../routes/update-status')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
