const mapAuth = require('../../auth/map-auth')
const getUser = require('../../auth/get-user')
const { getStageExecutionByApplication } = require('../../api/stage-execution')
const stageConfigId = require('../../constants/application-stage-configuration-ids')
const { status } = require('../../constants/status')
const stageExecutionActions = require('../../constants/application-stage-execution-actions')
const { formatStatusId, upperFirstLetter } = require('../../lib/display-helper')

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
    canClaimBeAuthorised: (claimRecommendedToPayByDifferentUser || claimRecommendedToRejectByDifferentUser) && !hasClaimAlreadyBeenAuthorised
  }
}

const claimStatus = (statusId) => {
  return {
    isApplicationInCheck: statusId === status.IN_CHECK,
    isApplicationRecommendedToPay: statusId === status.RECOMMENDED_TO_PAY,
    isApplicationRecommendedToReject: statusId === status.RECOMMENDED_TO_REJECT,
    isApplicationRecommendedToPayOrToReject: statusId === status.RECOMMENDED_TO_PAY || statusId === status.RECOMMENDED_TO_REJECT,
    isApplicationOnHold: (statusId === status.ON_HOLD)
  }
}

const queryStatus = (query) => {
  const { moveToInCheck, recommendToPay, recommendToReject, approve, reject } = query
  const neitherRecommendToPayNorToReject = !recommendToPay && !recommendToReject
  const approveOrReject = approve || reject
  return {
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    neitherRecommendToPayNorToReject,
    approve,
    reject,
    approveOrReject
  }
}

const determineDisplayForms = (statusId, authStatus, recommendStatus, applicationOrClaim, query) => {
  const { isApplicationInCheck, isApplicationRecommendedToPay, isApplicationRecommendedToReject, isApplicationRecommendedToPayOrToReject, isApplicationOnHold } = claimStatus(statusId)
  const { canUserRecommend, canUserAuthorise, canUserRecommendOrAuthorise } = authStatus
  const { canClaimBeRecommended, canClaimBeAuthorised } = recommendStatus
  const { moveToInCheck, recommendToPay, recommendToReject, neitherRecommendToPayNorToReject, approve, reject, approveOrReject } = queryStatus(query)

  const canClaimBeRecommendedByUser = isApplicationInCheck && canUserRecommend && canClaimBeRecommended
  const canClaimBeAuthorisedByUser = canUserAuthorise && canClaimBeAuthorised
  const canClaimBeMovedFromOnHold = isApplicationOnHold && canUserRecommendOrAuthorise

  const displayRecommendationForm = canClaimBeRecommendedByUser && neitherRecommendToPayNorToReject
  const displayRecommendToPayConfirmationForm = canClaimBeRecommendedByUser && recommendToPay
  const displayRecommendToRejectConfirmationForm = canClaimBeRecommendedByUser && recommendToReject
  const displayMoveToInCheckFromHold = canClaimBeMovedFromOnHold && !moveToInCheck
  const displayOnHoldConfirmationForm = canClaimBeMovedFromOnHold && moveToInCheck

  let displayAuthoriseOrRejectForm = false
  let displayAuthoriseToPayConfirmationForm = isApplicationRecommendedToPay && canClaimBeAuthorisedByUser
  let displayAuthoriseToRejectConfirmationForm = isApplicationRecommendedToReject && canClaimBeAuthorisedByUser
  if (applicationOrClaim === 'claim') {
    displayAuthoriseOrRejectForm = isApplicationRecommendedToPayOrToReject && canClaimBeAuthorisedByUser && !approveOrReject
    displayAuthoriseToPayConfirmationForm = displayAuthoriseToPayConfirmationForm && approve
    displayAuthoriseToRejectConfirmationForm = displayAuthoriseToRejectConfirmationForm && reject
  }

  return {
    displayRecommendationForm,
    displayRecommendToPayConfirmationForm,
    displayRecommendToRejectConfirmationForm,
    displayAuthoriseOrRejectForm,
    displayAuthorisePaymentButton: displayAuthoriseOrRejectForm && isApplicationRecommendedToPay,
    displayAuthoriseToPayConfirmationForm,
    displayAuthoriseToRejectConfirmationForm,
    displayMoveToInCheckFromHold,
    displayOnHoldConfirmationForm
  }
}

const claimFormHelper = async (request, applicationReference, statusId, applicationOrClaim = 'application') => {
  const userName = getUser(request).username
  const mappedAuth = {
    isAdministrator: mapAuth(request).isAdministrator,
    isRecommender: mapAuth(request).isRecommender,
    isAuthoriser: mapAuth(request).isAuthoriser,
    canUserRecommend: mapAuth(request).isAdministrator || mapAuth(request).isRecommender,
    canUserAuthorise: mapAuth(request).isAdministrator || mapAuth(request).isAuthoriser,
    canUserRecommendOrAuthorise: mapAuth(request).isAdministrator || mapAuth(request).isRecommender || mapAuth(request).isAuthoriser
  }

  const recommendStatus = await getRecommendationAndAuthorizationStatus(userName, applicationReference)
  const displayForms = determineDisplayForms(statusId, mappedAuth, recommendStatus, applicationOrClaim, request.query)

  const subStatus = upperFirstLetter(formatStatusId(statusId).toLowerCase())

  return {
    ...displayForms,
    subStatus
  }
}

module.exports = claimFormHelper
