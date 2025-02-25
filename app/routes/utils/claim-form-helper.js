const mapAuth = require('../../auth/map-auth')
const getUser = require('../../auth/get-user')
const { getStageExecutionByApplication } = require('../../api/stage-execution')
const stageConfigId = require('../../constants/application-stage-configuration-ids')
const { status } = require('../../constants/status')
const stageExecutionActions = require('../../constants/application-stage-execution-actions')
const { formatStatusId, upperFirstLetter } = require('../../lib/display-helper')

const getRecommendationAndAuthorizationStatus = async (userName, applicationReference, logger) => {
  const stageExecutions = await getStageExecutionByApplication(applicationReference, logger)
  const canClaimBeRecommended = stageExecutions.length === 0

  const processRecords = (actionType) => stageExecutions
    .filter(execution => execution.stageConfigurationId === stageConfigId.claimApproveRejectRecommender)
    .filter(execution => execution.action.action.includes(actionType))
    .filter(execution => execution.executedBy !== userName)
    .length > 0

  const hasClaimBeenRecommendedToPay = processRecords(stageExecutionActions.recommendToPay)
  const hasClaimBeenRecommendedToReject = processRecords(stageExecutionActions.recommendToReject)
  const claimRecommendedToPayByDifferentUser = processRecords(stageExecutionActions.recommendToPay)
  const claimRecommendedToRejectByDifferentUser = processRecords(stageExecutionActions.recommendToReject)

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
  const { moveToInCheck, recommendToPay, recommendToReject, approve, reject, updateStatus } = query
  const neitherRecommendToPayNorToReject = !recommendToPay && !recommendToReject
  const approveOrReject = approve || reject
  return {
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    neitherRecommendToPayNorToReject,
    approve,
    reject,
    approveOrReject,
    updateStatus
  }
}

const determineDisplayForms = (statusId, authStatus, recommendStatus, applicationOrClaim, query) => {
  const { isApplicationInCheck, isApplicationRecommendedToPay, isApplicationRecommendedToReject, isApplicationRecommendedToPayOrToReject, isApplicationOnHold } = claimStatus(statusId)
  const { canUserRecommend, canUserAuthorise, canUserRecommendOrAuthorise, isAdministrator } = authStatus
  const { canClaimBeRecommended, canClaimBeAuthorised } = recommendStatus
  const { moveToInCheck, recommendToPay, recommendToReject, neitherRecommendToPayNorToReject, approve, reject, approveOrReject, updateStatus } = queryStatus(query)

  const canClaimBeRecommendedByUser = isApplicationInCheck && canUserRecommend && canClaimBeRecommended
  const canClaimBeAuthorisedByUser = canUserAuthorise && canClaimBeAuthorised
  const canClaimBeMovedFromOnHold = isApplicationOnHold && canUserRecommendOrAuthorise
  const displayRecommendAction = canClaimBeRecommendedByUser && neitherRecommendToPayNorToReject
  const displayRecommendToPayForm = Boolean(canClaimBeRecommendedByUser && recommendToPay)
  const displayRecommendToRejectForm = Boolean(canClaimBeRecommendedByUser && recommendToReject)
  const displayMoveToInCheckAction = canClaimBeMovedFromOnHold && !moveToInCheck
  const displayMoveClaimToInCheckForm = Boolean(canClaimBeMovedFromOnHold && moveToInCheck)

  let displayAuthoriseOrRejectAction = false
  let displayAuthorisePaymentForm = isApplicationRecommendedToPay && canClaimBeAuthorisedByUser
  let displayRejectClaimForm = Boolean(isApplicationRecommendedToReject && canClaimBeAuthorisedByUser)
  let displayRejectAction = false

  displayAuthoriseOrRejectAction = isApplicationRecommendedToPayOrToReject && canClaimBeAuthorisedByUser && !approveOrReject
  displayRejectAction = displayAuthoriseOrRejectAction && isApplicationRecommendedToReject
  displayAuthorisePaymentForm = Boolean(displayAuthorisePaymentForm && approve)
  displayRejectClaimForm = Boolean(displayRejectClaimForm && reject)

  const displayUpdateStatusForm = Boolean(isAdministrator && updateStatus)

  return {
    displayRecommendAction,
    displayRecommendToPayForm,
    displayRecommendToRejectForm,
    displayAuthoriseOrRejectAction,
    displayAuthorisePaymentButton: displayAuthoriseOrRejectAction && isApplicationRecommendedToPay,
    displayAuthorisePaymentForm, // remove
    displayRejectAction,
    displayRejectClaimForm, // remove
    displayRejectForm: displayRejectClaimForm,
    authoriseAction: displayAuthoriseOrRejectAction && isApplicationRecommendedToPay,
    displayAuthoriseForm: displayAuthorisePaymentForm,
    displayMoveToInCheckAction,
    displayMoveClaimToInCheckForm, // remove
    displayMoveToInCheckForm: displayMoveClaimToInCheckForm,
    displayUpdateStatusForm
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

  const recommendStatus = await getRecommendationAndAuthorizationStatus(userName, applicationReference, request.logger)
  const displayForms = determineDisplayForms(statusId, mappedAuth, recommendStatus, applicationOrClaim, request.query)

  const subStatus = upperFirstLetter(formatStatusId(statusId).toLowerCase())

  return {
    ...displayForms,
    subStatus
  }
}

module.exports = claimFormHelper
