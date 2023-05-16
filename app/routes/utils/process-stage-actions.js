const { updateStageExecution, addStageExecution } = require('../../api/stage-execution')
const { getAllStageConfigurations } = require('../../api/stage-configuration')
const { processApplicationClaim } = require('../../api/applications')
const getUser = require('../../auth/get-user')
const applicationStageActions = require('../../constants/application-stage-execution-actions')

const processStageActions = async (request, role, stage, action, isClaimToBePaid) => {
  const userName = getUser(request).username
  const stageConfigurations = await getAllStageConfigurations()
  const step = stageConfigurations
    .find(configuration => configuration.role.roles.includes(role) &&
                configuration.stage === stage)

  const results = []
  let stageExecutionRow
  const stepId = step.id
  for (const stageAction of step.action.actions) {
    switch (stageAction) {
      case applicationStageActions.addStageExecutionEntry:
        const payload = {
          applicationReference: request.payload.reference,
          stageConfigurationId: stepId,
          executedAt: new Date(),
          executedBy: userName,
          action: {
            action
          }
        }
        stageExecutionRow = await addStageExecution(payload)
        results.push({ action: 'Added stage execution', stageExecutionRow })
        break
      case applicationStageActions.processApplicationClaim:
        results.push({ action: 'Processed claim', response: await processApplicationClaim(request.payload.reference, userName, isClaimToBePaid) })
        break
      case applicationStageActions.updateStageExecutionEntry:
        results.push({ action: 'Updated stage execution', response: await updateStageExecution(stageExecutionRow.id) })
        break
    }
  }
  return results
}

module.exports = processStageActions
