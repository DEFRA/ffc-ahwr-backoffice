const mapAuth = require('../../auth/map-auth')
const getUser = require('../../auth/get-user')
const { getStageExecutionByApplication } = require('../../api/stage-execution')
const stageConfigId = require('../../constants/application-stage-configuration-ids')
const stageExecutionActions = require('../../constants/application-stage-execution-actions')

const claimFormHelper = async (request, applicationReference, applicationStatus) => {
  const mappedAuth = mapAuth(request)
  const canUserRecommend = (mappedAuth.isAdministrator || mappedAuth.isRecommender)
  const canUserAuthorise = (mappedAuth.isAdministrator || mappedAuth.isAuthoriser)
  const userName = getUser(request).username
  const stageExecutions = await getStageExecutionByApplication(applicationReference)
  const isApplicationInCheck = (applicationStatus === 'IN CHECK')

  const canClaimBeRecommended = stageExecutions.length === 0
  const recommendToPayRecords = stageExecutions
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectRecommender)
    .filter(execution => execution.action.action.includes(stageExecutionActions.recommendToPay))
  const hasClaimBeenRecommenedToPay = recommendToPayRecords.length > 0
  const claimRecommendedToPayByDifferentUser = recommendToPayRecords
    .filter(execution => execution.executedBy !== userName).length > 0
  const recommendToRejectRecords = stageExecutions
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectRecommender)
    .filter(execution => execution.action.action.includes(stageExecutionActions.recommendToReject))
  const hasClaimBeenRecommendedToReject = recommendToRejectRecords.length > 0
  const claimRecommendedToRejectByDifferentUser = recommendToRejectRecords
    .filter(execution => execution.executedBy !== userName).length > 0
  const hasClaimAlreadyBeenAuthorised = stageExecutions
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectAuthoriser)
    .filter(execution => execution.action.action.includes(stageExecutionActions.authorisePayment) || execution.action.action.includes(stageExecutionActions.authoriseRejection)).length > 0
  const claimCanBeAuthorised = (claimRecommendedToPayByDifferentUser || claimRecommendedToRejectByDifferentUser) && !hasClaimAlreadyBeenAuthorised

  const displayRecommendationForm = isApplicationInCheck && canUserRecommend && canClaimBeRecommended && (!request.query.approve && !request.query.reject)
  const displayRecommendToPayConfirmationForm = isApplicationInCheck && canUserRecommend && canClaimBeRecommended && request.query.approve
  const displayRecommendToRejectConfirmationForm = isApplicationInCheck && canUserRecommend && canClaimBeRecommended && request.query.reject
  const displayAuthorisationForm = isApplicationInCheck && canUserAuthorise && claimCanBeAuthorised && (!request.query.approve && !request.query.reject)
  const displayAuthoriseToPayConfirmationForm = isApplicationInCheck && canUserAuthorise && claimCanBeAuthorised && request.query.approve
  const displayAuthoriseToRejectConfirmationForm = isApplicationInCheck && canUserAuthorise && claimCanBeAuthorised && request.query.reject

  let claimSubStatus = null
  if (!hasClaimAlreadyBeenAuthorised) {
    if (hasClaimBeenRecommenedToPay) {
      claimSubStatus = 'Recommend to pay'
    } else if (hasClaimBeenRecommendedToReject) {
      claimSubStatus = 'Recommend to reject'
    }
  }

  return {
    displayRecommendationForm,
    displayRecommendToPayConfirmationForm,
    displayRecommendToRejectConfirmationForm,
    displayAuthorisationForm,
    displayAuthoriseToPayConfirmationForm,
    displayAuthoriseToRejectConfirmationForm,
    claimSubStatus
  }
}

module.exports = claimFormHelper
