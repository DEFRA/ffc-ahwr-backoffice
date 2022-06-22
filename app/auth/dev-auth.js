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

const refresh = async (_, cookieAuth, _ = true) => {
  cookieAuth.set({
    scope: [holdAdmin, schemeAdmin],
    account: devAccount
  })

  return [holdAdmin, schemeAdmin]
}

const logout = async (_) => {
  devAccount.homeAccountId = uuidv4()
}

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout
}
