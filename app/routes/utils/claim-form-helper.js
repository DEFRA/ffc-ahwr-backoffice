const mapAuth = require('../../auth/map-auth')
const getUser = require('../../auth/get-user')
const { getStageExecutionByApplication } = require('../../api/stage-execution')
const stageConfigId = require('../../constants/application-stage-configuration-ids')
const stageExecutionActions = require('../../constants/application-stage-execution-actions')
const rbacEnabled = require('../../config').rbac.enabled
const { upperFirstLetter } = require('../../lib/display-helper')

const claimFormHelper = async (request, applicationReference, applicationStatus) => {
  const mappedAuth = mapAuth(request)
  const canUserRecommend = (mappedAuth.isAdministrator || mappedAuth.isRecommender)
  const canUserAuthorise = (mappedAuth.isAdministrator || mappedAuth.isAuthoriser)
  const userName = getUser(request).username
  const stageExecutions = await getStageExecutionByApplication(applicationReference)
  const isApplicationInCheck = (applicationStatus === 'IN CHECK')
  const isApplicationOnHold = (applicationStatus === 'ON HOLD')

  const canClaimBeRecommended = stageExecutions.length === 0
  const recommendToPayRecords = stageExecutions
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectRecommender)
    .filter(execution => execution.action.action.includes(stageExecutionActions.recommendToPay))
  const hasClaimBeenRecommendedToPay = recommendToPayRecords.length > 0
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

  const displayRecommendationForm = isApplicationInCheck && canUserRecommend && canClaimBeRecommended && (!request.query.recommendToPay && !request.query.recommendToReject) && rbacEnabled
  const displayRecommendToPayConfirmationForm = isApplicationInCheck && canUserRecommend && canClaimBeRecommended && request.query.recommendToPay && rbacEnabled
  const displayRecommendToRejectConfirmationForm = isApplicationInCheck && canUserRecommend && canClaimBeRecommended && request.query.recommendToReject && rbacEnabled
  const displayAuthorisationForm = isApplicationInCheck && canUserAuthorise && claimCanBeAuthorised && (!request.query.approve && !request.query.reject) && rbacEnabled
  const displayAuthoriseToPayConfirmationForm = isApplicationInCheck && canUserAuthorise && claimCanBeAuthorised && request.query.approve && rbacEnabled
  const displayAuthoriseToRejectConfirmationForm = isApplicationInCheck && canUserAuthorise && claimCanBeAuthorised && request.query.reject && rbacEnabled
  const displayMoveToInCheckFromHold = isApplicationOnHold && (canUserAuthorise || canUserRecommend) && !request.query.rejectOnHold && rbacEnabled
  const displayOnHoldConfirmationForm = isApplicationOnHold && (canUserAuthorise || canUserRecommend) && request.query.rejectOnHold && rbacEnabled
  console.log(request.query.rejectOnHold, 'request.query.rejectOnHold', displayOnHoldConfirmationForm, 'displayOnHoldConfirmationForm', displayMoveToInCheckFromHold, 'displayMoveToInCheckFromHold')
  let subStatus = upperFirstLetter(applicationStatus.toLowerCase())
  if (!hasClaimAlreadyBeenAuthorised) {
    if (hasClaimBeenRecommendedToPay) {
      subStatus = 'Recommend to pay'
    } else if (hasClaimBeenRecommendedToReject) {
      subStatus = 'Recommend to reject'
    }
  }

  console.log(`view-application: ${JSON.stringify({
    applicationReference,
    userName,
    applicationStatus,
    subStatus,
    canUserRecommend,
    canUserAuthorise,
    canClaimBeRecommended,
    claimCanBeAuthorised,
    claimRecommendedToPayByDifferentUser,
    claimRecommendedToRejectByDifferentUser,
    hasClaimAlreadyBeenAuthorised,
    rbacEnabled,
    displayMoveToInCheckFromHold,
    displayOnHoldConfirmationForm
  })}`)

  return {
    displayRecommendationForm,
    displayRecommendToPayConfirmationForm,
    displayRecommendToRejectConfirmationForm,
    displayAuthorisationForm,
    displayAuthoriseToPayConfirmationForm,
    displayAuthoriseToRejectConfirmationForm,
    subStatus,
    displayMoveToInCheckFromHold,
    displayOnHoldConfirmationForm
  }
}

module.exports = claimFormHelper
