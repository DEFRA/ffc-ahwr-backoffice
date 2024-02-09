const mapAuth = require('../../auth/map-auth')
const getUser = require('../../auth/get-user')
const { getStageExecutionByApplication } = require('../../api/stage-execution')
const stageConfigId = require('../../constants/application-stage-configuration-ids')
const stageExecutionActions = require('../../constants/application-stage-execution-actions')
const rbacEnabled = require('../../config').rbac.enabled
const { upperFirstLetter } = require('../../lib/display-helper')

const getRecommendationAndAuthorizationStatus = async (userName, applicationReference) => {
  const stageExecutions = await getStageExecutionByApplication(applicationReference)
  const canClaimBeRecommended = stageExecutions.length === 0
  // Process recommendation records
  const processRecords = (actionType, executedByUser) => stageExecutions
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectRecommender)
    .filter(execution => execution.action.action.includes(actionType))
    .filter(execution => executedByUser ? execution.executedBy === userName : execution.executedBy !== userName)
    .length > 0

  const hasClaimBeenRecommendedToPay = processRecords(stageExecutionActions.recommendToPay, false)
  const hasClaimBeenRecommendedToReject = processRecords(stageExecutionActions.recommendToReject, false)
  const claimRecommendedToPayByDifferentUser = processRecords(stageExecutionActions.recommendToPay, false)
  const claimRecommendedToRejectByDifferentUser = processRecords(stageExecutionActions.recommendToReject, false)
  
  // Check if claim has already been authorised
  const hasClaimAlreadyBeenAuthorised = stageExecutions
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectAuthoriser)
    .some(execution => [stageExecutionActions.authorisePayment, stageExecutionActions.authoriseRejection].includes(execution.action.action))

  return {
    canClaimBeRecommended,
    hasClaimBeenRecommendedToPay,
    hasClaimBeenRecommendedToReject,
    claimRecommendedToPayByDifferentUser,
    claimRecommendedToRejectByDifferentUser,
    hasClaimAlreadyBeenAuthorised,
    claimCanBeAuthorised: (claimRecommendedToPayByDifferentUser || claimRecommendedToRejectByDifferentUser) && !hasClaimAlreadyBeenAuthorised
  }
}

const determineDisplayForms = (applicationStatus, authStatus, recommendStatus, query) => {
  const isApplicationInCheck = (applicationStatus === 'IN CHECK')
  const isApplicationApproveRecommend = (applicationStatus === 'Recommended to Pay')
  const isApplicationRejectRecommend = (applicationStatus === 'Recommended to Reject')
  const isApplicationOnHold = (applicationStatus === 'ON HOLD')
  
  return {
    displayRecommendationForm: isApplicationInCheck && authStatus.canUserRecommend && recommendStatus.canClaimBeRecommended && !query.recommendToPay && !query.recommendToReject && rbacEnabled,
    displayRecommendToPayConfirmationForm: isApplicationInCheck && authStatus.canUserRecommend && recommendStatus.canClaimBeRecommended && query.recommendToPay && rbacEnabled,
    displayRecommendToRejectConfirmationForm: isApplicationInCheck && authStatus.canUserRecommend && recommendStatus.canClaimBeRecommended && query.recommendToReject && rbacEnabled,
    displayAuthoriseToPayConfirmationForm: isApplicationApproveRecommend && authStatus.canUserAuthorise && recommendStatus.claimCanBeAuthorised && rbacEnabled,
    displayAuthoriseToRejectConfirmationForm: isApplicationRejectRecommend && authStatus.canUserAuthorise && recommendStatus.claimCanBeAuthorised && rbacEnabled,
    displayMoveToInCheckFromHold: isApplicationOnHold && (authStatus.canUserAuthorise || authStatus.canUserRecommend) && !query.moveToInCheck && rbacEnabled,
    displayOnHoldConfirmationForm: isApplicationOnHold && (authStatus.canUserAuthorise || authStatus.canUserRecommend) && query.moveToInCheck && rbacEnabled
  }
}

const claimFormHelper = async (request, applicationReference, applicationStatus) => {
  const userName = getUser(request).username
  const mappedAuth = {
    isAdministrator: mapAuth(request).isAdministrator,
    isRecommender: mapAuth(request).isRecommender,
    isAuthoriser: mapAuth(request).isAuthoriser,
    canUserRecommend: mapAuth(request).isAdministrator || mapAuth(request).isRecommender,
    canUserAuthorise: mapAuth(request).isAdministrator || mapAuth(request).isAuthoriser
  }

  const recommendStatus = await getRecommendationAndAuthorizationStatus(userName, applicationReference)
  const displayForms = determineDisplayForms(applicationStatus, mappedAuth, recommendStatus, request.query)

  let subStatus = upperFirstLetter(applicationStatus.toLowerCase())
  if (!recommendStatus.hasClaimAlreadyBeenAuthorised) {
    subStatus = recommendStatus.hasClaimBeenRecommendedToPay ? 'Recommended to pay' : recommendStatus.hasClaimBeenRecommendedToReject ? 'Recommended to reject' : subStatus
  }
  
  return {
    ...displayForms,
    subStatus
  }
}

module.exports = claimFormHelper
