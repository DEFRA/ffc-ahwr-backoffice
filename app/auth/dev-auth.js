const { holdAdmin, schemeAdmin } = require('./permissions')
const { v4: uuidv4 } = require('uuid')
const devAccount = { homeAccountId: uuidv4(), name: 'Developer' }

const getAuthenticationUrl = () => {
  return '/dev-auth'
}

const authenticate = async (_, cookieAuth) => {
  cookieAuth.set({
    scope: [holdAdmin, schemeAdmin],
    account: devAccount
  })
}

const refresh = async (_account, cookieAuth, _forceRefresh = true) => {
  cookieAuth.set({
    scope: [holdAdmin, schemeAdmin],
    account: devAccount
  })

  return [holdAdmin, schemeAdmin]
}

const logout = async (_account) => {
  devAccount.homeAccountId = uuidv4()
}

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout
}
