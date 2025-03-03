const mapAuth = require('../../auth/map-auth')
const getUser = require('../../auth/get-user')
const { status } = require('../../constants/status')

const getClaimViewStates = (request, statusId, currentStatusEvent) => {
  const {
    withdraw,
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    approve,
    reject,
    updateStatus
  } = request.query

  const { username } = getUser(request)

  const {
    isAdministrator,
    isRecommender,
    isAuthoriser
  } = mapAuth(request)

  const withdrawAction =
    (isAdministrator || isAuthoriser) &&
    statusId === status.AGREED &&
    withdraw === false

  const withdrawForm =
    (isAdministrator || isAuthoriser) &&
    statusId === status.AGREED &&
    withdraw === true

  const moveToInCheckAction =
    (isAdministrator || isRecommender || isAuthoriser) &&
    statusId === status.ON_HOLD &&
    moveToInCheck === false

  const moveToInCheckForm =
    (isAdministrator || isRecommender || isAuthoriser) &&
    statusId === status.ON_HOLD &&
    moveToInCheck === true

  const recommendAction =
    (isAdministrator || isRecommender) &&
    statusId === status.IN_CHECK &&
    recommendToPay === false &&
    recommendToReject === false

  const recommendToPayForm =
    (isAdministrator || isRecommender) &&
    statusId === status.IN_CHECK &&
    recommendToPay === true

  const recommendToRejectForm =
    (isAdministrator || isRecommender) &&
    statusId === status.IN_CHECK &&
    recommendToReject === true

  const authoriseAction =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_PAY &&
    approve === false &&
    currentStatusEvent &&
    username !== currentStatusEvent.ChangedBy

  const authoriseForm =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_PAY &&
    approve === true &&
    currentStatusEvent &&
    username !== currentStatusEvent.ChangedBy

  const rejectAction =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_REJECT &&
    reject === false &&
    currentStatusEvent &&
    username !== currentStatusEvent.ChangedBy

  const rejectForm =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_REJECT &&
    reject === true &&
    currentStatusEvent &&
    username !== currentStatusEvent.ChangedBy

  const updateStatusForm = Boolean(isAdministrator && updateStatus)

  return {
    withdrawAction,
    withdrawForm,
    moveToInCheckAction,
    moveToInCheckForm,
    recommendAction,
    recommendToPayForm,
    recommendToRejectForm,
    authoriseAction,
    authoriseForm,
    rejectAction,
    rejectForm,
    updateStatusForm
  }
}

module.exports = { getClaimViewStates }
