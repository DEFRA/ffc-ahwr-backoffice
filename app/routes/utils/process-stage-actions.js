const { updateStageExecution, addStageExecution } = require('../../api/stage-execution')
const { getAllStageConfigurations } = require('../../api/stage-configuration')
const { processApplicationClaim } = require('../../api/applications')
const { updateClaimStatus } = require('../../api/claims')
const { status } = require('../../constants/status')
const getUser = require('../../auth/get-user')
const applicationStageActions = require('../../constants/application-stage-execution-actions')

const processStageActions = async (request, role, stage, action, isClaimToBePaid) => {
  request.logger.setBindings({ role, stage, action, isClaimToBePaid })

  try {
    const newStatus = isClaimToBePaid ? status.READY_TO_PAY : status.REJECTED
    const userName = getUser(request).username
    const stageConfigurations = await getAllStageConfigurations(request.logger)
    role = role.charAt(0).toUpperCase() + role.slice(1)
    const step = stageConfigurations
      .find(configuration => configuration.role.roles.includes(role) &&
                configuration.stage === stage)
    request.logger.setBindings({ step })
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
            applicationReference: request.payload.reference,
            stageConfigurationId: stepId,
            executedAt: new Date(),
            executedBy: userName,
            action: {
              action
            }
          }, request.logger)
          results.push({ action: 'Added stage execution', stageExecutionRow })
          break
        case applicationStageActions.processApplicationClaim: {
          const response = request.payload.claimOrApplication === 'application'
            ? await processApplicationClaim(request.payload.reference, userName, isClaimToBePaid, request.logger)
            : await updateClaimStatus(request.payload.reference, userName, newStatus, request.logger)
          results.push({ action: 'Processed claim', response })
          break
        }
        case applicationStageActions.updateStageExecutionEntry:
          results.push({ action: 'Updated stage execution', response: await updateStageExecution(stageExecutionRow.id, request.logger) })
          break
      }
    }
    return results
  } catch (err) {
    request.logger.setBindings({ err })
    throw err
  }
}

module.exports = processStageActions
