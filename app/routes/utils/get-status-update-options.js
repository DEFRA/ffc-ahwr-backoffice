import { upperFirstLetter } from "../../lib/display-helper.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library";

const statusUpdateOptions = {
  IN_CHECK: CLAIM_STATUS.IN_CHECK,
  RECOMMENDED_TO_PAY: CLAIM_STATUS.RECOMMENDED_TO_PAY,
  RECOMMENDED_TO_REJECT: CLAIM_STATUS.RECOMMENDED_TO_REJECT,
};

export const getStatusUpdateOptions = (statusId) =>
  Object.entries(statusUpdateOptions)
    .filter(([_, value]) => value !== statusId)
    .map(([key, value]) => ({
      text: upperFirstLetter(key.toLowerCase()).replace(/_/g, " "),
      value,
    }));
