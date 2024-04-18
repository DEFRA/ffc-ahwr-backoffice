const getUser = require('../../auth/get-user')
const { upperFirstLetter } = require('../../lib/display-helper')

const getRows = (request) => {
  const userName = getUser(request).username
  const roles = request.auth.credentials.scope.map(x => upperFirstLetter(x)).join(', ')
  const rows = [
    { key: { text: 'User' }, value: { text: userName } },
    { key: { text: 'Role' }, value: { text: roles } }
  ]

  return rows
}

function ViewModel (request) {
  this.model = {
    userScopes: { rows: getRows(request) }
  }
}

module.exports = ViewModel
