const { holdAdmin, schemeAdmin } = require('./permissions')
const { v4: uuidv4 } = require('uuid')
const devAccount = { homeAccountId: uuidv4(), name: 'Developer' }

const getAuthenticationUrl = () => {
  return '/dev-auth'
}

const authenticate = async (redirectCode, cookieAuth) => {
  cookieAuth.set({
    scope: [holdAdmin, schemeAdmin],
    account: devAccount
  })
}

const refresh = async (account, cookieAuth, forceRefresh = true) => {
  cookieAuth.set({
    scope: [holdAdmin, schemeAdmin],
    account: devAccount
  })

  return [holdAdmin, schemeAdmin]
}

const logout = async (account) => {
  devAccount.homeAccountId = uuidv4()
}

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout
}
