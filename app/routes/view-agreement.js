import { Buffer } from "buffer";
import joi from "joi";
import {
  getApplication,
  getApplicationHistory,
  getApplicationEvents,
} from "../api/applications.js";
import { permissions } from "../auth/permissions.js";
import { getStyleClassByStatus } from "../constants/status.js";
import { getClaimViewStates } from "./utils/get-claim-view-states.js";
import { getCurrentStatusEvent } from "./utils/get-current-status-event.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library";
import { getErrorMessagesByKey } from "./utils/get-error-messages-by-key.js";
import { getStatusUpdateOptions } from "./utils/get-status-update-options.js";
import { getContactHistory, displayContactHistory } from "../api/contact-history.js";
import { upperFirstLetter } from "../lib/display-helper.js";
import { getOrganisationDetails } from "./models/organisation-details.js";
import { getApplicationDetails } from "./models/application-details.js";
import { getHistoryDetails } from "./models/application-history.js";
import { getApplicationClaimDetails } from "./models/application-claim.js";

const { administrator, processor, user, recommender, authoriser } = permissions;

export const viewAgreementRoute = {
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
        updateEligiblePiiRedaction: joi.bool().default(false),
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
          application.statusId === CLAIM_STATUS.IN_CHECK ||
          application.statusId === CLAIM_STATUS.READY_TO_PAY ||
          application.statusId === CLAIM_STATUS.REJECTED) &&
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
      const isRedacted = application.applicationRedacts.length > 0

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
        updateEligiblePiiRedactionAction,
        updateEligiblePiiRedactionForm,
      } = !isRedacted ? getClaimViewStates(request, application.statusId, currentStatusEvent) : {};

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
      const eligiblePiiRedactionActions = updateEligiblePiiRedactionAction
        ? getAction(
            "updateEligiblePiiRedaction",
            "eligible for automated data redaction",
            "update-eligible-pii-redaction",
          )
        : null;

      const contactHistory = await getContactHistory(request.params.reference, request.logger);
      const contactHistoryDetails = displayContactHistory(contactHistory);
      const { organisation } = application.data;
      const organisationDetails = getOrganisationDetails(organisation, contactHistoryDetails);
      const applicationDetails = getApplicationDetails(
        application,
        statusActions,
        eligiblePiiRedactionActions,
      );
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
        updateEligiblePiiRedactionAction,
        updateEligiblePiiRedactionForm,
        eligiblePiiRedaction: application.eligiblePiiRedaction,
        statusOptions,
        errorMessages,
        errors,
      });
    },
  },
};
