const { administrator, processor, user } = require('./permissions')
const { v4: uuidv4 } = require('uuid')
const devAccount = { homeAccountId: uuidv4(), name: 'Developer' }

const getAuthenticationUrl = () => {
  return '/dev-auth'
}

const authenticate = async (_, cookieAuth) => {
  cookieAuth.set({
    scope: [administrator, processor, user],
    account: devAccount
  })
}

const refresh = async (_account, cookieAuth, _forceRefresh = true) => {
  cookieAuth.set({
    scope: [administrator, processor, user],
    account: devAccount
  })

  return [administrator, processor, user]
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
