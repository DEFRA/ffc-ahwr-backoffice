const { user, recommender, authoriser } = require('./permissions')
const { v4: uuidv4 } = require('uuid')
const devAccount = { homeAccountId: uuidv4(), name: 'Developer' }
const isAuthoriser = false
const recommenderScope = [recommender, user]
const authoriserScope = [authoriser, user]

const getAuthenticationUrl = () => {
  return '/dev-auth'
}

const authenticate = async (_, cookieAuth) => {
  cookieAuth.set({
    scope: isAuthoriser ? authoriserScope : recommenderScope,
    account: devAccount
  })
}

const refresh = async (_account, cookieAuth, _forceRefresh = true) => {
  cookieAuth.set({
    scope: isAuthoriser ? authoriserScope : recommenderScope,
    account: devAccount
  })

  return isAuthoriser ? authoriserScope : recommenderScope
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
