// If we want to use the common library, which is ESM, we would have to import it like this:
// const { MULTIPLE_HERD_REASONS } = await import("ffc-ahwr-common-library");
// This causes problems when testing, as Jest throws a segfault.

// The fix would be to move Backoffice to ESM as per the other repos, at which point
// it can import from the common library properly.

const getHerdReasonsText = (reasons, isSheep) => {
  if (!reasons) {
    return "-";
  }

  const MULTIPLE_HERD_REASONS = {
    separateManagementNeeds: "They have separate management needs",
    uniqueHealthNeeds: "They have unique health needs",
    differentBreed: "They are a different breed",
    differentPurpose: "They are used for another purpose (e.g. breeding)",
    keptSeparate: "They have been kept completely separate",
    other: `Other reasons based on my vet's judgement`,
    onlyHerd: `This is the only ${isSheep ? "flock" : "herd"}`,
  };

  const formattedReasons = reasons.map(
    (reason) => MULTIPLE_HERD_REASONS[reason],
  );

  const startOfHtml = '<ul class="govuk-list govuk-list--bullet">';
  const endOfHtml = "</ul>";
  const middleOfHtml = formattedReasons
    .map((reason) => `<li>${reason}</li>`)
    .join("\n");

  return `${startOfHtml}${middleOfHtml}${endOfHtml}`;
};

module.exports = { getHerdReasonsText };
