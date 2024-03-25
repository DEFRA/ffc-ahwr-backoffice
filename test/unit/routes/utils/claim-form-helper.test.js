jest.mock('../../../../../app/config', () => ({
  ...jest.requireActual('../../../../../app/config'),
  agreementWithdrawl: {
    enabled: true
  },
  rbac: {
    enabled: true
  }
}))

const claimFormHelper = require('../../../../app/routes/utils/claim-form-helper')
const stageConfigId = require('../../../../app/constants/application-stage-configuration-ids')
const stageExecutionActions = require('../../../../app/constants/application-stage-execution-actions')
const stageExecution = require('../../../../app/api/stage-execution')
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
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus).toBe('In check')
  })

  test.each([
    ['administrator', true],
    ['processor', false],
    ['user', false],
    ['recommender', true],
    ['authoriser', false],
    ['processor, user', false],
    ['administrator, processor, user, recommender, authoriser', true]
  ])('For role %s - recommended to pay confirmation form displayed is %s', async (roles, expectedResult) => {
    const request = {
      query: {
        approve: true,
        reject: false,
        recommendToPay: true
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
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus).toBe('In check')
  })

  test.each([
    ['administrator', true],
    ['processor', false],
    ['user', false],
    ['recommender', true],
    ['authoriser', false],
    ['processor, user', false],
    ['administrator, processor, user, recommender, authoriser', true]
  ])('For role %s - recommended to reject confirmation form displayed is %s', async (roles, expectedResult) => {
    const request = {
      query: {
        approve: false,
        reject: true,
        recommendToReject: true
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
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus).toBe('In check')
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
      applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToPay
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus.toUpperCase()).toBe(applicationStatus)
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
    const applicationStatus = 'Recommended to Pay'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([{
      stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
      applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToPay
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBe(expectedResult)
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus).toBe('Recommended to pay')
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
    const applicationStatus = 'Recommended to Reject'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([{
      stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
      applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToReject
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBe(expectedResult)
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus).toBe('Recommended to reject')
  })

  test.each([
    ['administrator'],
    ['processor'],
    ['user'],
    ['recommender'],
    ['authoriser'],
    ['processor'],
    ['administrator, processor, user, recommender, authoriser']
  ])('For role %s - claim paid, no forms displayed', async (roles) => {
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
            name: 'Mr Auth'
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([{
      stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
      applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToPay
      }
    },
    {
      stageConfigurationId: stageConfigId.claimApproveRejectAuthoriser,
      applicationReference,
      executedBy: 'Mr Auth',
      action: {
        action: stageExecutionActions.authorisePayment
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus).toBe('In check')
  })

  test.each([
    ['administrator'],
    ['processor'],
    ['user'],
    ['recommender'],
    ['authoriser'],
    ['processor'],
    ['administrator, processor, user, recommender, authoriser']
  ])('For role %s - claim rejected, no forms displayed', async (roles) => {
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
            name: 'Mr Auth'
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    const applicationStatus = 'IN CHECK'

    stageExecution.getStageExecutionByApplication.mockResolvedValue([{
      stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
      applicationReference,
      executedBy: 'Mr Recommender',
      action: {
        action: stageExecutionActions.recommendToPay
      }
    },
    {
      stageConfigurationId: stageConfigId.claimApproveRejectAuthoriser,
      applicationReference,
      executedBy: 'Mr Auth',
      action: {
        action: stageExecutionActions.authoriseRejection
      }
    }])

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayRecommendationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayRecommendToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToPayConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayAuthoriseToRejectConfirmationForm).toBeFalsy()
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBeFalsy()
    expect(claimFormHelperResult.subStatus).toBe('In check')
  })

  test.each([
    ['recommender', 'IN CHECK', 'In check'],
    ['recommender', 'IN CHECK', 'Recommended to pay'],
    ['recommender', 'IN CHECK', 'Recommended to reject'],
    ['authoriser', 'IN CHECK', 'In check'],
    ['authoriser', 'IN CHECK', 'Recommended to pay'],
    ['authoriser', 'IN CHECK', 'Recommended to reject'],
    ['authoriser', 'READY TO PAY', 'Ready to pay'],
    ['authoriser', 'REJECTED', 'Rejected']
  ])('For role %s - %s valid sub status %s displayed', async (roles, applicationStatus, expectedSubStatus) => {
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
            name: 'Mr Auth'
          }
        }
      }
    }
    const applicationReference = 'testAppRef'
    let stageAction
    switch (expectedSubStatus) {
      case 'Recommended to pay':
        stageAction = stageExecutionActions.recommendToPay
        break
      case 'Recommended to reject':
        stageAction = stageExecutionActions.recommendToReject
        break
      case 'Ready to pay':
        stageAction = stageExecutionActions.authorisePayment
        break
      case 'Rejected':
        stageAction = stageExecutionActions.authoriseRejection
        break
      default:
        break
    }

    if (expectedSubStatus === 'In check') {
      stageExecution.getStageExecutionByApplication.mockResolvedValue([])
    } else {
      stageExecution.getStageExecutionByApplication.mockResolvedValue([{
        stageConfigurationId: stageConfigId.claimApproveRejectRecommender,
        applicationReference,
        executedBy: 'Mr Recommender',
        action: {
          action: stageAction
        }
      }])
    }

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.subStatus.toUpperCase()).toBe(applicationStatus)
  })

  test.each([
    ['recommender', 'ON HOLD'],
    ['recommender', 'ON HOLD'],
    ['recommender', 'ON HOLD'],
    ['authoriser', 'ON HOLD'],
    ['authoriser', 'ON HOLD'],
    ['authoriser', 'ON HOLD'],
    ['authoriser', 'ON HOLD'],
    ['authoriser', 'ON HOLD']
  ])('Move to IN CHECK from ON HOLD For role %s - a valid status displayed', async (roles, applicationStatus) => {
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
            name: 'Mr Auth'
          }
        }
      }
    }
    const applicationReference = 'testAppRef'

    const claimFormHelperResult = await claimFormHelper(request, applicationReference, applicationStatus)
    expect(claimFormHelperResult.displayMoveToInCheckFromHold).toBe(true)
  })
})
