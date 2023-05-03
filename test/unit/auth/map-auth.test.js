const mapAuth = require('../../../app/auth/map-auth')
const { administrator, processor, user, recommender, authoriser } = require('../../../app/auth/permissions')

describe('Map auth test', () => {
  test.each([
    [administrator, true, false, false, false, false],
    [processor, false, true, false, false, false],
    [user, false, false, true, false, false],
    [recommender, false, false, false, true, false],
    [authoriser, false, false, false, false, true]
  ])('returns auth object - %s role', async (userRole, isAdministratorRole, isProcessorRole, isUserRole, isRecommenderRole, isAuthoriserRole) => {
    const request = { auth: { isAuthenticated: true, credentials: { scope: [userRole] } } }
    const res = mapAuth(request)
    expect(res).toMatchObject({
      isAuthenticated: true,
      isAnonymous: false,
      isAdministrator: isAdministratorRole,
      isProcessor: isProcessorRole,
      isUser: isUserRole,
      isRecommender: isRecommenderRole,
      isAuthoriser: isAuthoriserRole
    })
  })
})
