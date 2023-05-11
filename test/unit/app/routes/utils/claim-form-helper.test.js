const claimFormHelper = require('../../../../../app/routes/utils/claim-form-helper')
const stageConfigId = require('../../../../../app/constants/application-stage-configuration-ids')
const stageExecutionActions = require('../../../../../app/constants/application-stage-execution-actions')
const stageExecution = require('../../../../../app/api/stage-execution')
jest.mock('../../../../../app/api/stage-execution')

describe('Claim form helper tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    ['administrator', true],
    ['processor', false],
    ['user', false],
    ['recommender', true],
    ['authoriser', false],
    ['processor, user', false],
    ['administrator, processor, user, recommender, authoriser', true]
  ])('For role %s - recommendation form displayed is %s', async (roles, expectedResult) => {
    const request = {
      query: {
        approve: false,
        reject: false
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: roles,
          account: {
            homeAccountId: 'testId',
            name: 'Mr Recommender'
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBe(expectedResult)
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthorisationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.claimSubStatus).toBeNull()
  })

  test.each([
    ['administrator', true],
    ['processor', false],
    ['user', false],
    ['recommender', true],
    ['authoriser', false],
    ['processor, user', false],
    ['administrator, processor, user, recommender, authoriser', true]
  ])('For role %s - recommend to pay confirmation form displayed is %s', async (roles, expectedResult) => {
    const request = {
      query: {
        approve: true,
        reject: false
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: roles,
          account: {
            homeAccountId: 'testId',
            name: 'Mr Recommender'
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBe(expectedResult)
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthorisationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.claimSubStatus).toBeNull()
  })

  test.each([
    ['administrator', true],
    ['processor', false],
    ['user', false],
    ['recommender', true],
    ['authoriser', false],
    ['processor, user', false],
    ['administrator, processor, user, recommender, authoriser', true]
  ])('For role %s - recommend to reject confirmation form displayed is %s', async (roles, expectedResult) => {
    const request = {
      query: {
        approve: false,
        reject: true
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: roles,
          account: {
            homeAccountId: 'testId',
            name: 'Mr Recommender'
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBe(expectedResult)
    expect(claimFormHelperResult.displayAuthorisationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.claimSubStatus).toBeNull()
  })

  test.each([
    ['administrator', 'Mr Auth', true],
    ['processor', 'Mr Auth', false],
    ['user', 'Mr Auth', false],
    ['recommender', 'Mr Auth', false],
    ['authoriser', 'Mr Auth', true],
    ['processor, user', 'Mr Auth', false],
    ['administrator, processor, user, recommender, authoriser', 'Mr Auth', true],
    ['administrator, processor, user, recommender, authoriser', 'Mr Recommender', false]
  ])('For role %s - authorisation form displayed for user %s should be %s', async (roles, userName, expectedResult) => {
    const request = {
      query: {
        approve: false,
        reject: false
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: roles,
          account: {
            homeAccountId: 'testId',
            name: userName
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([{
      stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
      applicationReference: applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToPay
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthorisationForm).toBe(expectedResult)
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.claimSubStatus).toBe('Recommend to pay')
  })

  test.each([
    ['administrator', 'Mr Auth', true],
    ['processor', 'Mr Auth', false],
    ['user', 'Mr Auth', false],
    ['recommender', 'Mr Auth', false],
    ['authoriser', 'Mr Auth', true],
    ['processor, user', 'Mr Auth', false],
    ['administrator, processor, user, recommender, authoriser', 'Mr Auth', true],
    ['administrator, processor, user, recommender, authoriser', 'Mr Recommender', false]
  ])('For role %s - authorise to pay form displayed for user %s should be %s', async (roles, userName, expectedResult) => {
    const request = {
      query: {
        approve: true,
        reject: false
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: roles,
          account: {
            homeAccountId: 'testId',
            name: userName
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([{
      stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
      applicationReference: applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToPay
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthorisationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBe(expectedResult)
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.claimSubStatus).toBe('Recommend to pay')
  })

  test.each([
    ['administrator', 'Mr Auth', true],
    ['processor', 'Mr Auth', false],
    ['user', 'Mr Auth', false],
    ['recommender', 'Mr Auth', false],
    ['authoriser', 'Mr Auth', true],
    ['processor, user', 'Mr Auth', false],
    ['administrator, processor, user, recommender, authoriser', 'Mr Auth', true],
    ['administrator, processor, user, recommender, authoriser', 'Mr Recommender', false]
  ])('For role %s - authorise to reject form displayed for user %s should be %s', async (roles, userName, expectedResult) => {
    const request = {
      query: {
        approve: false,
        reject: true
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: roles,
          account: {
            homeAccountId: 'testId',
            name: userName
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([{
      stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
      applicationReference: applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToReject
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthorisationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBe(expectedResult)
    expect(claimFormHelperResult.claimSubStatus).toBe('Recommend to reject')
  })
})