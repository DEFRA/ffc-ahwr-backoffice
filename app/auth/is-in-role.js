const isInRole = (credentials, role) => {
  if (credentials?.scope) {
    return credentials.scope.includes(role)
  }
  return false
}

module.exports = isInRole
