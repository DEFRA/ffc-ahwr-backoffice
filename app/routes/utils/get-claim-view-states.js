import { CLAIM_STATUS } from "ffc-ahwr-common-library";
import { mapAuth } from "../../auth/map-auth.js";

const getAdminAndRecommenderActions = ({
  isAdminOrRecommender,
  claimIsInCheck,
  recommendToPay,
  recommendToReject,
}) => {
  const recommendAction =
    isAdminOrRecommender &&
    claimIsInCheck &&
    recommendToPay === false &&
    recommendToReject === false;

  const recommendToPayForm = isAdminOrRecommender && claimIsInCheck && recommendToPay === true;

  const recommendToRejectForm =
    isAdminOrRecommender && claimIsInCheck && recommendToReject === true;

  return { recommendAction, recommendToPayForm, recommendToRejectForm };
};

const getAdminAndAuthoriserActions = ({
  isAdminOrAuthorisor,
  claimIsAgreed,
  withdraw,
  claimIsRecommendedToPay,
  approve,
  currentStatusEvent,
  claimIsRecommendedToReject,
  reject,
  name,
}) => {
  const withdrawAction = isAdminOrAuthorisor && claimIsAgreed && withdraw === false;
  const withdrawForm = isAdminOrAuthorisor && claimIsAgreed && withdraw === true;
  const authoriseAction =
    isAdminOrAuthorisor &&
    claimIsRecommendedToPay &&
    approve === false &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const authoriseForm =
    isAdminOrAuthorisor &&
    claimIsRecommendedToPay &&
    approve === true &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const rejectAction =
    isAdminOrAuthorisor &&
    claimIsRecommendedToReject &&
    reject === false &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  const rejectForm =
    isAdminOrAuthorisor &&
    claimIsRecommendedToReject &&
    reject === true &&
    statusWasSetByAnotherUser(currentStatusEvent, name);

  return { withdrawAction, withdrawForm, authoriseAction, authoriseForm, rejectAction, rejectForm };
};

const getAdminAndAuthoriserAndRecommenderActions = ({
  isAdminOrAuthorisorOrRecommender,
  claimIsOnHold,
  moveToInCheck,
}) => {
  const moveToInCheckAction =
    isAdminOrAuthorisorOrRecommender && claimIsOnHold && moveToInCheck === false;

  const moveToInCheckForm =
    isAdminOrAuthorisorOrRecommender && claimIsOnHold && moveToInCheck === true;

  return { moveToInCheckAction, moveToInCheckForm };
};

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
  const isAdminOrAuthorisor = isAdministrator || isAuthoriser;
  const isAdminOrRecommender = isAdministrator || isRecommender;
  const isAdminOrAuthorisorOrRecommender = isAdministrator || isAuthoriser || isRecommender;
  const claimIsInCheck = statusId === CLAIM_STATUS.IN_CHECK;
  const claimIsAgreed = statusId === CLAIM_STATUS.AGREED;
  const claimIsOnHold = statusId === CLAIM_STATUS.ON_HOLD;
  const claimIsRecommendedToPay = statusId === CLAIM_STATUS.RECOMMENDED_TO_PAY;
  const claimIsRecommendedToReject = statusId === CLAIM_STATUS.RECOMMENDED_TO_REJECT;

  const { withdrawAction, withdrawForm, authoriseAction, authoriseForm, rejectAction, rejectForm } =
    getAdminAndAuthoriserActions({
      isAdminOrAuthorisor,
      claimIsAgreed,
      withdraw,
      claimIsRecommendedToPay,
      approve,
      currentStatusEvent,
      claimIsRecommendedToReject,
      reject,
      name,
    });

  const { recommendAction, recommendToPayForm, recommendToRejectForm } =
    getAdminAndRecommenderActions({
      isAdminOrRecommender,
      claimIsInCheck,
      recommendToPay,
      recommendToReject,
    });

  const { moveToInCheckAction, moveToInCheckForm } = getAdminAndAuthoriserAndRecommenderActions({
    isAdminOrAuthorisorOrRecommender,
    claimIsOnHold,
    moveToInCheck,
  });

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
