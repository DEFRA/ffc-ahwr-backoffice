const { getStageExecution } = require('../../api/stage')
const stageConfigId = require('../../constants/application-stage-configuration-ids')

const mapStageExecutionToStatus = async (reference) => {
  const stageExecutions = await getStageExecution()

  const isClaimReadyForRecommendation = stageExecutions
    .filter(execution => execution.applicationReference === reference).length === 0

  const claimHasBeenRecommenedToPay = stageExecutions
    .filter(execution => execution.applicationReference === reference)
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectRecommender)
    .filter(execution => execution.action.action.includes('pay')).length > 0

  const claimHasBeenRecommendedToReject = stageExecutions
    .filter(execution => execution.applicationReference === reference)
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectRecommender)
    .filter(execution => execution.action.action.includes('reject')).length > 0

  const claimHasBeenRecommended = claimHasBeenRecommenedToPay || claimHasBeenRecommendedToReject

  const claimHasBeenPaid = stageExecutions
    .filter(execution => execution.applicationReference === reference)
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectAuthoriser)
    .filter(execution => execution.action.action.includes('Paid')).length > 0

  const claimHasBeenRejected = stageExecutions
    .filter(execution => execution.applicationReference === reference)
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectAuthoriser)
    .filter(execution => execution.action.action.includes('Rejected')).length > 0

  const claimHasBeenAuthorised = claimHasBeenPaid || claimHasBeenRejected

  return {
    isClaimReadyForRecommendation,
    claimHasBeenRecommenedToPay,
    claimHasBeenRecommendedToReject,
    claimHasBeenRecommended,
    claimHasBeenAuthorised
  }
}

module.exports = mapStageExecutionToStatus
