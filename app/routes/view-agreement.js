const { Buffer } = require("buffer");
const joi = require("joi");
const {
  getApplication,
  getApplicationHistory,
  getApplicationEvents,
} = require("../api/applications");
const { administrator, processor, user, recommender, authoriser } = require("../auth/permissions");
const { getStyleClassByStatus } = require("../constants/status");
const { getClaimViewStates } = require("./utils/get-claim-view-states");
const { getCurrentStatusEvent } = require("./utils/get-current-status-event");
const applicationStatus = require("../constants/application-status");
const { getErrorMessagesByKey } = require("./utils/get-error-messages-by-key");
const { getStatusUpdateOptions } = require("./utils/get-status-update-options");
const { getContactHistory, displayContactHistory } = require("../api/contact-history");
const { upperFirstLetter } = require("../lib/display-helper");
const { getOrganisationDetails } = require("./models/organisation-details");
const { getApplicationDetails } = require("./models/application-details");
const { getHistoryDetails } = require("./models/application-history");
const { getApplicationClaimDetails } = require("./models/application-claim");

module.exports = {
  method: "get",
  path: "/view-agreement/{reference}",
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    validate: {
      params: joi.object({
        reference: joi.string(),
      }),
      query: joi.object({
        page: joi.number().greater(0).default(1),
        errors: joi.string().allow(null),
        withdraw: joi.bool().default(false),
        moveToInCheck: joi.bool().default(false),
        recommendToPay: joi.bool().default(false),
        recommendToReject: joi.bool().default(false),
        approve: joi.bool().default(false),
        reject: joi.bool().default(false),
        updateStatus: joi.bool().default(false),
        updateVetsName: joi.bool().default(false),
        updateDateOfVisit: joi.bool().default(false),
        updateVetRCVSNumber: joi.bool().default(false),
      }),
    },
    handler: async (request, h) => {
      const { page } = request.query;
      const application = await getApplication(request.params.reference, request.logger);
      const { historyRecords } = await getApplicationHistory(
        request.params.reference,
        request.logger,
      );

      const currentStatusEvent = getCurrentStatusEvent(application, historyRecords);

      let applicationEvents;
      if (
        (application.claimed ||
          application.statusId === applicationStatus.inCheck ||
          application.statusId === applicationStatus.readyToPay ||
          application.statusId === applicationStatus.rejected) &&
        !application.data.dateOfClaim
      ) {
        applicationEvents = await getApplicationEvents(
          application?.data?.organisation.sbi,
          request.logger,
        );
      }

      const status = application.status.status.toUpperCase();
      const statusLabel = upperFirstLetter(application.status.status.toLowerCase());
      const statusClass = getStyleClassByStatus(application.status.status);

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
        updateStatusAction,
        updateStatusForm,
        updateVetsNameAction,
        updateVetsNameForm,
        updateVetRCVSNumberAction,
        updateVetRCVSNumberForm,
        updateDateOfVisitAction,
        updateDateOfVisitForm,
      } = getClaimViewStates(request, application.statusId, currentStatusEvent);

      const errors = request.query.errors
        ? JSON.parse(Buffer.from(request.query.errors, "base64").toString("utf8"))
        : [];

      const statusOptions = getStatusUpdateOptions(application.statusId);

      const getAction = (query, visuallyHiddenText, id) => ({
        items: [
          {
            href: `/view-agreement/${application.reference}?${query}=true&page=${page}#${id}`,
            text: "Change",
            visuallyHiddenText,
          },
        ],
      });
      const statusActions = updateStatusAction
        ? getAction("updateStatus", "status", "update-status")
        : null;
      const dateOfVisitActions = updateDateOfVisitAction
        ? getAction("updateDateOfVisit", "date of review", "update-date-of-visit")
        : null;
      const vetsNameActions = updateVetsNameAction
        ? getAction("updateVetsName", "vet's name", "update-vets-name")
        : null;
      const vetRCVSNumberActions = updateVetRCVSNumberAction
        ? getAction("updateVetRCVSNumber", "RCVS number", "update-vet-rcvs-number")
        : null;

      const contactHistory = await getContactHistory(request.params.reference, request.logger);
      const contactHistoryDetails = displayContactHistory(contactHistory);
      const { organisation } = application.data;
      const organisationDetails = getOrganisationDetails(organisation, contactHistoryDetails);
      const applicationDetails = getApplicationDetails(application, statusActions);
      const historyDetails = getHistoryDetails(historyRecords);
      const applicationClaimDetails = getApplicationClaimDetails(
        application,
        applicationEvents,
        statusActions,
        dateOfVisitActions,
        vetsNameActions,
        vetRCVSNumberActions,
      );
      const errorMessages = getErrorMessagesByKey(errors);

      return h.view("view-agreement", {
        page,
        reference: application.reference,
        claimOrAgreement: "agreement",
        status,
        statusLabel,
        statusClass,
        organisationName: application.data.organisation.name,
        vetVisit: application.vetVisit,
        claimed: application.claimed,
        payment: application.payment,
        organisationDetails,
        applicationDetails,
        historyDetails,
        applicationClaimDetails,
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
        updateStatusForm,
        updateDateOfVisitForm,
        updateVetsNameForm,
        updateVetRCVSNumberForm,
        statusOptions,
        errorMessages,
        errors,
      });
    },
  },
};
