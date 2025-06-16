import { claimType } from "../constants/claim-type.js";

export const getReviewType = (typeOfReview) => {
  return {
    isReview: typeOfReview === claimType.review,
    isEndemicsFollowUp: typeOfReview === claimType.endemics,
  };
};
