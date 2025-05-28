const mapAuth = require("../../auth/map-auth");
const { status } = require("../../constants/status");

const getClaimViewStates = (request, statusId, currentStatusEvent) => {
  const {
    withdraw,
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    approve,
    reject,
    updateStatus,
    updateVetsName,
    updateDateOfVisit,
    updateVetRCVSNumber,
  } = request.query;
  const { name } = request.auth.credentials.account;

  const { isAdministrator, isRecommender, isAuthoriser, isSuperAdmin } = mapAuth(request);

  const withdrawAction =
    (isAdministrator || isAuthoriser) && statusId === status.AGREED && withdraw === false;

  const withdrawForm =
    (isAdministrator || isAuthoriser) && statusId === status.AGREED && withdraw === true;

  const moveToInCheckAction =
    (isAdministrator || isRecommender || isAuthoriser) &&
    statusId === status.ON_HOLD &&
    moveToInCheck === false;

  const moveToInCheckForm =
    (isAdministrator || isRecommender || isAuthoriser) &&
    statusId === status.ON_HOLD &&
    moveToInCheck === true;

  const recommendAction =
    (isAdministrator || isRecommender) &&
    statusId === status.IN_CHECK &&
    recommendToPay === false &&
    recommendToReject === false;

  const recommendToPayForm =
    (isAdministrator || isRecommender) && statusId === status.IN_CHECK && recommendToPay === true;

  const recommendToRejectForm =
    (isAdministrator || isRecommender) &&
    statusId === status.IN_CHECK &&
    recommendToReject === true;

  const authoriseAction =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_PAY &&
    approve === false &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const authoriseForm =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_PAY &&
    approve === true &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const rejectAction =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_REJECT &&
    reject === false &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const rejectForm =
    (isAdministrator || isAuthoriser) &&
    statusId === status.RECOMMENDED_TO_REJECT &&
    reject === true &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const {
    updateStatusAction,
    updateStatusForm,
    updateVetsNameAction,
    updateVetsNameForm,
    updateVetRCVSNumberAction,
    updateVetRCVSNumberForm,
    updateDateOfVisitAction,
    updateDateOfVisitForm,
  } = superAdminActions(
    isSuperAdmin,
    statusId,
    updateStatus,
    updateVetsName,
    updateVetRCVSNumber,
    updateDateOfVisit,
  );

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
    updateStatusAction,
    updateStatusForm,
    updateVetsNameAction,
    updateVetsNameForm,
    updateVetRCVSNumberAction,
    updateVetRCVSNumberForm,
    updateDateOfVisitAction,
    updateDateOfVisitForm,
  };
};

const statusWasSetByAnotherUser = (currentStatusEvent, name) => {
  return currentStatusEvent && name !== currentStatusEvent.updatedBy;
};

const superAdminActions = (
  isSuperAdmin,
  statusId,
  updateStatus,
  updateVetsName,
  updateVetRCVSNumber,
  updateDateOfVisit,
) => {
  const updateStatusAction = isSuperAdmin && statusId !== status.READY_TO_PAY;

  const updateStatusForm =
    isSuperAdmin && updateStatus === true && statusId !== status.READY_TO_PAY;

  const updateVetsNameAction = isSuperAdmin;
  const updateVetsNameForm = isSuperAdmin && updateVetsName === true;

  const updateVetRCVSNumberAction = isSuperAdmin;
  const updateVetRCVSNumberForm = isSuperAdmin && updateVetRCVSNumber === true;

  const updateDateOfVisitAction = isSuperAdmin;
  const updateDateOfVisitForm = isSuperAdmin && updateDateOfVisit === true;

  return {
    updateStatusAction,
    updateStatusForm,
    updateVetsNameAction,
    updateVetsNameForm,
    updateVetRCVSNumberAction,
    updateVetRCVSNumberForm,
    updateDateOfVisitAction,
    updateDateOfVisitForm,
  };
};

module.exports = { getClaimViewStates };
