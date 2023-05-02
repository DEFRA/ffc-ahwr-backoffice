const getUser = require('../../auth/get-user')
const config = require('../../config')

const getRows = (request) => {
  const userName = getUser(request).username
  const roles = request.auth.credentials.scope.join(', ')
  const rows = [
    { key: { text: 'User' }, value: { text: userName } },
    { key: { text: 'Roles' }, value: { text: roles } }
  ]

  return rows
}

function ViewModel (request) {
  this.model = {
    userScopes: { rows: getRows(request) },
    rbac: config.rbac
  }
}

module.exports = ViewModel
