const getHerdReasonsText = async (reasons) => {
  if (!reasons) {
    return "-";
  }

  // Has to be imported like this because the common library is ESM
  const { MULTIPLE_HERD_REASONS } = await import("ffc-ahwr-common-library");

  const formattedReasons = reasons.map((reason) => {
    if (MULTIPLE_HERD_REASONS[reason]) {
      return MULTIPLE_HERD_REASONS[reason];
    }

    return "This is the only herd";
  });

  const startOfHtml = '<ul class="govuk-list govuk-list--bullet">';
  const endOfHtml = "</ul>";
  const middleOfHtml = formattedReasons
    .map((reason) => `<li>${reason}</li>`)
    .join("\n");

  return `${startOfHtml}${middleOfHtml}${endOfHtml}`;
};

module.exports = { getHerdReasonsText };
