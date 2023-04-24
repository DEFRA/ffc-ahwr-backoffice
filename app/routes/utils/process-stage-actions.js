const { createStageExecution, updateStageExecution, getStageConfiguration } = require('../../api/stage')
const { processApplicationClaim } = require('../../api/applications')
const getUser = require('../../auth/get-user')
const applicationStageActions = require('../../constants/application-stage-actions')

const processStageActions = async (request, role, stage, action) => {
  const userName = getUser(request).username
  const stageConfiguration = await getStageConfiguration()
  const step = stageConfiguration
    .find(configuration => configuration.role.roles.includes(role) &&
                configuration.stage === stage)

  let stageExecutionRow
  const stepId = step.id
  for (const stageAction of step.action.actions) {
    switch (stageAction) {
      case applicationStageActions.addStageExecutionEntry:
        stageExecutionRow = await createStageExecution(request.payload.reference, stepId, userName, { action: `${action}` })
        break
      case applicationStageActions.processApplicationClaim:
        await processApplicationClaim(request.payload.reference, userName, true)
        break
      case applicationStageActions.updateStageExecutionEntry:
        await updateStageExecution(stageExecutionRow.id)
        break
    }
  }
}

module.exports = processStageActions
