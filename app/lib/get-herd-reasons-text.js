import { MULTIPLE_HERD_REASONS } from "ffc-ahwr-common-library";

export const getHerdReasonsText = (reasons, isSheep) => {
  if (!reasons) {
    return "-";
  }

  const fleshedOutReasons = {
    ...MULTIPLE_HERD_REASONS,
    onlyHerd: `This is the only ${isSheep ? "flock" : "herd"}`,
  };

  const formattedReasons = reasons.map((reason) => fleshedOutReasons[reason]);

  const startOfHtml = '<ul class="govuk-list govuk-list--bullet">';
  const endOfHtml = "</ul>";
  const middleOfHtml = formattedReasons.map((reason) => `<li>${reason}</li>`).join("\n");

  return `${startOfHtml}${middleOfHtml}${endOfHtml}`;
};
