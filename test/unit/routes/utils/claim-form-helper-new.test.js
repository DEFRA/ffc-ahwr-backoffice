const claimFormHelper = require('../../../../app/routes/utils/claim-form-helper')
const { status } = require('../../../../app/constants/status')
const mapAuth = require('../../../../app/auth/map-auth')
const { getStageExecutionByApplication } = require('../../../../app/api/stage-execution')
const { claimApproveRejectRecommender, claimApproveRejectAuthoriser } = require('../../../../app/constants/application-stage-configuration-ids')

jest.mock('../../../../app/auth/get-user', () =>
  jest.fn().mockImplementation(() => ({ username: 'testUser' }))
)
jest.mock('../../../../app/auth/map-auth')
jest.mock('../../../../app/api/stage-execution')

test('status: on hold, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.ON_HOLD, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: true,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'On hold'
  })
})

test('status: on hold, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.ON_HOLD, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: true,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'On hold'
  })
})

test('status: on hold, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.ON_HOLD, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: true,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'On hold'
  })
})

test('status: on hold, user: user', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.ON_HOLD, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'On hold'
  })
})

test('status: on hold, query: moveToInCheck, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { moveToInCheck: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.ON_HOLD, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: true,
    updateStatusForm: false,
    subStatus: 'On hold'
  })
})

test('status: on hold, query: moveToInCheck, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { moveToInCheck: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.ON_HOLD, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: true,
    updateStatusForm: false,
    subStatus: 'On hold'
  })
})

test('status: on hold, query: moveToInCheck, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { moveToInCheck: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.ON_HOLD, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: true,
    updateStatusForm: false,
    subStatus: 'On hold'
  })
})

test('status: in check, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: true,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: true,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, query: recommendToPay, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { recommendToPay: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: true,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, query: recommendToPay, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { recommendToPay: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: true,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, query: recommendToPay, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { recommendToPay: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, query: recommendToReject, user: admin', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { recommendToReject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: true,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, query: recommendToReject, user: recommender', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { recommendToReject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: true,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in check, query: recommendToReject, user: authoriser', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })
  getStageExecutionByApplication.mockReturnValueOnce([])

  const request = { query: { recommendToReject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.IN_CHECK, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'In check'
  })
})

test('status: in recommended to pay, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'someone else'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: true,
    displayAuthorisePaymentButton: true,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to pay'
  })
})

test('status: in recommended to pay, user: admin, recommender: same person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'testUser'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to pay'
  })
})

test('status: in recommended to pay, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'someone else'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to pay'
  })
})

test('status: in recommended to pay, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'someone else'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: true,
    displayAuthorisePaymentButton: true,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to pay'
  })
})

test('status: in recommended to pay, query: approve, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'someone else'
  }])

  const request = { query: { approve: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: true,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to pay'
  })
})

test('status: in recommended to pay, query: approve, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'someone else'
  }])

  const request = { query: { approve: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to pay'
  })
})

test('status: in recommended to pay, query: approve, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'someone else'
  }])

  const request = { query: { approve: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: true,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to pay'
  })
})

test('status: in recommended to reject, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'someone else'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: true,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in recommended to reject, user: admin, recommender: same person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'testUser'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in recommended to reject, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'someone else'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in recommended to reject, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'someone else'
  }])

  const request = { query: {} }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: true,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in recommended to reject, query: reject, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'someone else'
  }])

  const request = { query: { reject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: true,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in recommended to reject, query: reject, user: admin, recommender: same person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'testUser'
  }])

  const request = { query: { reject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in recommended to reject, query: reject, user: recommender, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: true,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'someone else'
  }])

  const request = { query: { reject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in recommended to reject, query: reject, user: authoriser, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: false,
    isRecommender: false,
    isAuthoriser: true
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to reject' },
    executedBy: 'someone else'
  }])

  const request = { query: { reject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.RECOMMENDED_TO_REJECT, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: true,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Recommended to reject'
  })
})

test('status: in ready to pay, user: admin, recommender: different person', async () => {
  mapAuth.mockReturnValue({
    isAdministrator: true,
    isRecommender: false,
    isAuthoriser: false
  })

  getStageExecutionByApplication.mockReturnValueOnce([{
    stageConfigurationId: claimApproveRejectRecommender,
    action: { action: 'Recommend to pay' },
    executedBy: 'someone else'
  }, {
    stageConfigurationId: claimApproveRejectAuthoriser,
    action: { action: 'Ready to pay' },
    executedBy: 'someone else'
  }])

  const request = { query: { reject: true } }
  const state = await claimFormHelper(request, 'REDC-A123-B456', status.READY_TO_PAY, 'claim')

  expect(state).toEqual({
    requestIdleCallbackecommendAction: false,
    recommendToPayForm: false,
    recommendToRejectForm: false,
    displayAuthoriseOrRejectAction: false,
    displayAuthorisePaymentButton: false,
    displayAuthorisePaymentForm: false,
    displayRejectClaimForm: false,
    moveToInCheckAction: false,
    displayMoveClaimToInCheckForm: false,
    updateStatusForm: false,
    subStatus: 'Ready to pay'
  })
})
