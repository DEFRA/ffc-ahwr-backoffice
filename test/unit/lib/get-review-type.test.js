import { getReviewType } from "../../../app/lib/get-review-type";
import { claimType } from "../../../app/constants/claim-type";

describe("getReviewType", () => {
  let typeOfReview;
  test("returns correct value for Review claim type", () => {
    typeOfReview = claimType.review;
    const { isReview, isEndemicsFollowUp } = getReviewType(typeOfReview);

    expect(isReview).toBe(true);
    expect(isEndemicsFollowUp).toBe(false);
  });

  test("returns correct value for Endemics Follow-up clam type", () => {
    typeOfReview = claimType.endemics;
    const { isReview, isEndemicsFollowUp } = getReviewType(typeOfReview);

    expect(isReview).toBe(false);
    expect(isEndemicsFollowUp).toBe(true);
  });
});
