import { CLAIM_STATUS } from "ffc-ahwr-common-library";
import { mapAuth } from "../../auth/map-auth.js";

const getAdminActionsAvailable = ({
  isAdministrator,
  isAuthoriser,
  statusId,
  withdraw,
  isRecommender,
  moveToInCheck,
  recommendToPay,
  recommendToReject,
  approve,
  reject,
  currentStatusEvent,
  name,
}) => {
  const withdrawAction =
    (isAdministrator || isAuthoriser) && statusId === CLAIM_STATUS.AGREED && withdraw === false;

  const withdrawForm =
    (isAdministrator || isAuthoriser) && statusId === CLAIM_STATUS.AGREED && withdraw === true;

  const moveToInCheckAction =
    (isAdministrator || isRecommender || isAuthoriser) &&
    statusId === CLAIM_STATUS.ON_HOLD &&
    moveToInCheck === false;

  const moveToInCheckForm =
    (isAdministrator || isRecommender || isAuthoriser) &&
    statusId === CLAIM_STATUS.ON_HOLD &&
    moveToInCheck === true;

  const recommendAction =
    (isAdministrator || isRecommender) &&
    statusId === CLAIM_STATUS.IN_CHECK &&
    recommendToPay === false &&
    recommendToReject === false;

  const recommendToPayForm =
    (isAdministrator || isRecommender) &&
    statusId === CLAIM_STATUS.IN_CHECK &&
    recommendToPay === true;

  const recommendToRejectForm =
    (isAdministrator || isRecommender) &&
    statusId === CLAIM_STATUS.IN_CHECK &&
    recommendToReject === true;

  const authoriseAction =
    (isAdministrator || isAuthoriser) &&
    statusId === CLAIM_STATUS.RECOMMENDED_TO_PAY &&
    approve === false &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const authoriseForm =
    (isAdministrator || isAuthoriser) &&
    statusId === CLAIM_STATUS.RECOMMENDED_TO_PAY &&
    approve === true &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const rejectAction =
    (isAdministrator || isAuthoriser) &&
    statusId === CLAIM_STATUS.RECOMMENDED_TO_REJECT &&
    reject === false &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const rejectForm =
    (isAdministrator || isAuthoriser) &&
    statusId === CLAIM_STATUS.RECOMMENDED_TO_REJECT &&
    reject === true &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

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
  };
};

export const getClaimViewStates = (request, statusId, currentStatusEvent) => {
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

  const {
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
  } = getAdminActionsAvailable({
    isAdministrator,
    isAuthoriser,
    statusId,
    withdraw,
    isRecommender,
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    approve,
    reject,
    currentStatusEvent,
    name,
  });

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
  const updateStatusAction = isSuperAdmin && statusId !== CLAIM_STATUS.READY_TO_PAY;

  const updateStatusForm =
    isSuperAdmin && updateStatus === true && statusId !== CLAIM_STATUS.READY_TO_PAY;

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
