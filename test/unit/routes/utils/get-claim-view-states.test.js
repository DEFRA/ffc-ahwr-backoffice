const { getClaimViewStates } = require('../../../../app/routes/utils/get-claim-view-states')
const { status } = require('../../../../app/constants/status')
const mapAuth = require('../../../../app/auth/map-auth')

const currentUser = 'testUser'
jest.mock('../../../../app/auth/get-user', () =>
  jest.fn().mockImplementation(() => ({ username: currentUser }))
)
jest.mock('../../../../app/auth/map-auth')

test('status: agreed, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      withdraw: false
    }
  }
  const state = await getClaimViewStates(request, status.AGREED)

  expect(state).toEqual({
    withdrawAction: true,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: agreed, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      withdraw: false
    }
  }
  const state = await getClaimViewStates(request, status.AGREED)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: agreed, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      withdraw: false
    }
  }
  const state = await getClaimViewStates(request, status.AGREED)

  expect(state).toEqual({
    withdrawAction: true,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: agreed, query: withdraw, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      withdraw: true
    }
  }
  const state = await getClaimViewStates(request, status.AGREED)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: true,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: agreed, query: withdraw, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      withdraw: true
    }
  }
  const state = await getClaimViewStates(request, status.AGREED)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: agreed, query: withdraw, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      withdraw: true
    }
  }
  const state = await getClaimViewStates(request, status.AGREED)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: true,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: on hold, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      moveToInCheck: false
    }
  }
  const state = await getClaimViewStates(request, status.ON_HOLD)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: true,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: on hold, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      moveToInCheck: false
    }
  }
  const state = await getClaimViewStates(request, status.ON_HOLD)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: true,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: on hold, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      moveToInCheck: false
    }
  }
  const state = await getClaimViewStates(request, status.ON_HOLD)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: true,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: on hold, user: user', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      moveToInCheck: false
    }
  }
  const state = await getClaimViewStates(request, status.ON_HOLD)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: on hold, query: moveToInCheck, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      moveToInCheck: true
    }
  }
  const state = await getClaimViewStates(request, status.ON_HOLD)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: true,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: on hold, query: moveToInCheck, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      moveToInCheck: true
    }
  }
  const state = await getClaimViewStates(request, status.ON_HOLD)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: true,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: on hold, query: moveToInCheck, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      moveToInCheck: true
    }
  }
  const state = await getClaimViewStates(request, status.ON_HOLD)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: true,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      recommendToPay: false,
      recommendToReject: false
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: true,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      recommendToPay: false,
      recommendToReject: false
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: true,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      recommendToPay: false,
      recommendToReject: false
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, query: recommendToPay, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      recommendToPay: true
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: true,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, query: recommendToPay, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      recommendToPay: true
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: true,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, query: recommendToPay, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      recommendToPay: true
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, query: recommendToReject, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      recommendToReject: true
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: true,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, query: recommendToReject, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      recommendToReject: true
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: true,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in check, query: recommendToReject, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      recommendToReject: true
    }
  }
  const state = await getClaimViewStates(request, status.IN_CHECK)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to pay, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      approve: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_PAY, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: true,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to pay, user: admin, recommender: same person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      approve: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: currentUser
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_PAY, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to pay, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      approve: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_PAY, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to pay, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      approve: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_PAY, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: true,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to pay, query: approve, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      approve: true
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_PAY, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: true,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to pay, query: approve, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      approve: true
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_PAY, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to pay, query: approve, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      approve: true
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_PAY, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: true,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      reject: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: true,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, user: admin, recommender: same person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      reject: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: currentUser
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      reject: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      reject: false
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: true,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, query: reject, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      reject: true
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: true,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, query: reject, user: admin, recommender: same person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  const request = {
    query: {
      reject: true
    }
  }
  const currentStatusEvent = {
    ChangedBy: currentUser
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, query: reject, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  const request = {
    query: {
      reject: true
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: false,
    updateStatusForm: false
  })
})

test('status: in recommended to reject, query: reject, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  const request = {
    query: {
      reject: true
    }
  }
  const currentStatusEvent = {
    ChangedBy: 'someone else'
  }
  const state = await getClaimViewStates(request, status.RECOMMENDED_TO_REJECT, currentStatusEvent)

  expect(state).toEqual({
    withdrawAction: false,
    withdrawForm: false,
    moveToInCheckAction: false,
    moveToInCheckForm: false,
    recommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    authoriseAction: false,
    authoriseForm: false,
    rejectAction: false,
    rejectForm: true,
    updateStatusForm: false
  })
})
