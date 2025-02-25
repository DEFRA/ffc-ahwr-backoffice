const getUser = (request) => {
  return {
    userId: request.auth.credentials.account.homeAccountId,
    username: 'Harry' // request.auth.credentials.account.name
  }
}

module.exports = getUser
