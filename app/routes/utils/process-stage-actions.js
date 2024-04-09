const { updateStageExecution, addStageExecution } = require('../../api/stage-execution')
const { getAllStageConfigurations } = require('../../api/stage-configuration')
const { processApplicationClaim } = require('../../api/applications')
const { processClaims } = require('../../api/claims')
const getUser = require('../../auth/get-user')
const applicationStageActions = require('../../constants/application-stage-execution-actions')

const processStageActions = async (request, role, stage, action, isClaimToBePaid) => {
  try {
    console.log(`processStageActions - Processing stage actions for ${JSON.stringify({ payload: request.payload, role, stage, action, isClaimToBePaid })}`)
    const userName = getUser(request).username
    const stageConfigurations = await getAllStageConfigurations()
    role = role.charAt(0).toUpperCase() + role.slice(1)
    const step = stageConfigurations
      .find(configuration => configuration.role.roles.includes(role) &&
                configuration.stage === stage)
    console.log(`processStageActions - Found step ${JSON.stringify(step)} for stageConfigurations ${JSON.stringify(stageConfigurations)}`)
    if (!step) {
      throw new Error(`Error when filtering stage configurations for role ${role} and stage ${stage}`)
    }
    const results = []
    let stageExecutionRow
    const stepId = step.id

    for (const stageAction of step.action.actions) {
      switch (stageAction) {
        case applicationStageActions.addStageExecutionEntry:
          stageExecutionRow = await addStageExecution({
            claimOrApplication: request.payload.claimOrApplication,
            reference: request.payload.reference,
            stageConfigurationId: stepId,
            executedAt: new Date(),
            executedBy: userName,
            action: {
              action
            }
          })
          console.log(`processStageActions - Added stage execution ${JSON.stringify(stageExecutionRow)} for stage action ${stageAction}`)
          results.push({ action: 'Added stage execution', stageExecutionRow })
          break
        case applicationStageActions.processApplicationClaim:
          const response = request.payload.claimOrApplication === 'application' ? 
            await processApplicationClaim(request.payload.reference, userName, isClaimToBePaid) : 
            await processClaims(request.payload.reference, userName, isClaimToBePaid)
          results.push({ action: 'Processed claim', response})
          console.log(`processStageActions - Processed claim ${JSON.stringify(request.payload.reference, userName, isClaimToBePaid)} for stage action ${stageAction}`)
          break
        case applicationStageActions.updateStageExecutionEntry:
          results.push({ action: 'Updated stage execution', response: await updateStageExecution(stageExecutionRow.id) })
          console.log(`processStageActions - Updated stage execution ${stageExecutionRow.id} for stage action ${stageAction}`)
          break
      }
    }
    console.log(`processStageActions - Stage executions added: ${results}`)
    return results
  } catch (error) {
    console.log('processStageActions error: ', error.message)
    console.error(error)
    throw error
  }
}

module.exports = processStageActions
