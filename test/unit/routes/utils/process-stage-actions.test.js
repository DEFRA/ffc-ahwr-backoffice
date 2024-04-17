const processStageActions = require('../../../../app/routes/utils/process-stage-actions')

const mockRequest = {
  payload: {
    reference: 'AHWR-555A-FD4C',
    claimOrApplication: 'application'
  }
}
const mockStepId = 1
const mockRole = 'Recommender'
const mockStage = 'Claim Approve/Reject'
const isClaimToBePaid = false

jest.mock('../../../../app/auth/get-user')
const getUser = require('../../../../app/auth/get-user')
getUser.mockReturnValue({ username: 'test-user' })

jest.mock('../../../../app/api/stage-configuration')
const { getAllStageConfigurations } = require('../../../../app/api/stage-configuration')
getAllStageConfigurations.mockResolvedValue([
  {
    id: mockStepId,
    role: {
      roles: [mockRole]
    },
    stage: mockStage,
    action: {
      actions: ['addStageExecutionEntry', 'processApplicationClaim', 'updateStageExecutionEntry']
    }
  }
])

jest.mock('../../../../app/api/stage-execution')
const { addStageExecution, updateStageExecution } = require('../../../../app/api/stage-execution')
addStageExecution.mockResolvedValue('stage-execution-row')
updateStageExecution.mockResolvedValue('stage-execution-row')

jest.mock('../../../../app/api/applications')
const { processApplicationClaim } = require('../../../../app/api/applications')
processApplicationClaim.mockResolvedValue('claim-processed')

describe('Process stage action test', () => {
  let logSpy
  let errorSpy
  beforeAll(() => {
    jest.clearAllMocks()
    logSpy = jest.spyOn(console, 'log')
    errorSpy = jest.spyOn(console, 'error')
  })
  test('Process all actions', async () => {
    const response = await processStageActions(mockRequest, mockRole, mockStage, 'Recommended to pay', isClaimToBePaid)
    expect(response).toEqual([
      { action: 'Added stage execution', stageExecutionRow: 'stage-execution-row' },
      { action: 'Processed claim', response: 'claim-processed' },
      { action: 'Updated stage execution', response: 'stage-execution-row' }
    ])
  })
  test('Process all actions for claim', async () => {
    const response = await processStageActions({
      payload: {
        reference: 'AHWR-555A-FD4C',
        claimOrApplication: 'claim'
      }
    }, mockRole, mockStage, 'Recommended to pay', isClaimToBePaid)
    expect(response).toEqual([
      { action: 'Added stage execution', stageExecutionRow: 'stage-execution-row' },
      { action: 'Processed claim', response: false },
      { action: 'Updated stage execution', response: 'stage-execution-row' }
    ])
  })
  test('Process all actions for claim', async () => {
    const response = await processStageActions({
      payload: {
        reference: 'AHWR-555A-FD4C',
        claimOrApplication: 'claim'
      }
    }, mockRole, mockStage, 'Recommended to pay', true)
    expect(response).toEqual([
      { action: 'Added stage execution', stageExecutionRow: 'stage-execution-row' },
      { action: 'Processed claim', response: false },
      { action: 'Updated stage execution', response: 'stage-execution-row' }
    ])
  })

  test('Role not found should log error and re-throw it', async () => {
    await expect(
      processStageActions(mockRequest, 'Wrong role', mockStage, 'Recommended to pay', isClaimToBePaid)
    ).rejects.toThrow(new Error('Error when filtering stage configurations for role Wrong role and stage Claim Approve/Reject'))

    expect(logSpy).toHaveBeenCalledWith('processStageActions error: ', `Error when filtering stage configurations for role Wrong role and stage ${mockStage}`)
    expect(errorSpy).toHaveBeenCalledWith(new Error(`Error when filtering stage configurations for role Wrong role and stage ${mockStage}`)
    )
  })
})
