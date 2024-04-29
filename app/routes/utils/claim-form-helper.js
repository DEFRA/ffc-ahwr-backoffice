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
    claimCanBeAuthorised: (claimRecommendedToPayByDifferentUser || claimRecommendedToRejectByDifferentUser) && !hasClaimAlreadyBeenAuthorised
  }
}

const determineDisplayForms = (statusId, authStatus, recommendStatus, applicationOrClaim, query) => {
  const isApplicationInCheck = (statusId === status.IN_CHECK)
  const isApplicationApproveRecommend = (statusId === status.RECOMMENDED_TO_PAY)
  const isApplicationRejectRecommend = (statusId === status.RECOMMENDED_TO_REJECT)
  const isApplicationOnHold = (statusId === status.ON_HOLD)

  const { canUserRecommend, canUserAuthorise, canUserRecommendOrAuthorise } = authStatus
  const { canClaimBeRecommended, claimCanBeAuthorised } = recommendStatus

  const canClaimBeRecommendedByUser = isApplicationInCheck && canUserRecommend && canClaimBeRecommended
  const canClaimBeAuthorisedByUser = canUserAuthorise && claimCanBeAuthorised
  const canClaimBeMovedFromOnHold = isApplicationOnHold && canUserRecommendOrAuthorise

  const authoriseOrRejectForm = (isApplicationApproveRecommend || isApplicationRejectRecommend) && canClaimBeAuthorisedByUser && !(query.approve || query.reject)
  const authoriseToPayConfirmation = isApplicationApproveRecommend && canClaimBeAuthorisedByUser
  const authoriseToRejectConfirmation = isApplicationRejectRecommend && canClaimBeAuthorisedByUser

  const displayRecommendationForm = canClaimBeRecommendedByUser && !query.recommendToPay && !query.recommendToReject
  const displayRecommendToPayConfirmationForm = canClaimBeRecommendedByUser && query.recommendToPay
  const displayRecommendToRejectConfirmationForm = canClaimBeRecommendedByUser && query.recommendToReject
  const displayMoveToInCheckFromHold = canClaimBeMovedFromOnHold && !query.moveToInCheck
  const displayOnHoldConfirmationForm = canClaimBeMovedFromOnHold && query.moveToInCheck

  let displayAuthoriseOrRejectForm
  let displayAuthoriseToPayConfirmationForm
  let displayAuthoriseToRejectConfirmationForm
  if (applicationOrClaim === 'claim') {
    displayAuthoriseOrRejectForm = authoriseOrRejectForm
    displayAuthoriseToPayConfirmationForm = authoriseToPayConfirmation && query.approve
    displayAuthoriseToRejectConfirmationForm = authoriseToRejectConfirmation && query.reject
  } else {
    displayAuthoriseOrRejectForm = false
    displayAuthoriseToPayConfirmationForm = authoriseToPayConfirmation
    displayAuthoriseToRejectConfirmationForm = authoriseToRejectConfirmation
  }

  return {
    displayRecommendationForm,
    displayRecommendToPayConfirmationForm,
    displayRecommendToRejectConfirmationForm,
    displayAuthoriseOrRejectForm,
    displayAuthorisePaymentButton: displayAuthoriseOrRejectForm && isApplicationApproveRecommend,
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
