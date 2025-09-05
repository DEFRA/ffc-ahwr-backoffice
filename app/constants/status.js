const BLUE = "govuk-tag--blue";
const GREEN = "govuk-tag--green";
const GREY = "govuk-tag--grey";
const YELLOW = "govuk-tag--yellow";
const ORANGE = "govuk-tag--orange";
const PURPLE = "govuk-tag--purple";
const PINK = "govuk-tag--pink";
const RED = "govuk-tag--red";
const statusStyle = {
  APPLIED: {
    styleClass: GREEN,
  },
  AGREED: {
    styleClass: GREEN,
  },
  WITHDRAWN: {
    styleClass: GREY,
  },
  PAID: {
    styleClass: BLUE,
  },
  DATAINPUTTED: {
    styleClass: YELLOW,
  },
  REJECTED: {
    styleClass: RED,
  },
  NOTAGREED: {
    styleClass: PINK,
  },
  ACCEPTED: {
    styleClass: PURPLE,
  },
  CHECK: {
    styleClass: ORANGE,
  },
  CLAIMED: {
    styleClass: BLUE,
  },
  INCHECK: {
    styleClass: ORANGE,
  },
  RECOMMENDEDTOPAY: {
    styleClass: ORANGE,
  },
  RECOMMENDEDTOREJECT: {
    styleClass: ORANGE,
  },
  READYTOPAY: {
    styleClass: "govuk-tag",
  },
  ONHOLD: {
    styleClass: PURPLE,
  },
  SENTTOFINANCE: {
    styleClass: PINK,
  },
};

export const getStyleClassByStatus = (rawStatus) => {
  if (rawStatus === undefined) {
    return ORANGE;
  }

  const normalisedStatus = rawStatus.replace(/\s/g, "");
  const matchedStatus = statusStyle[normalisedStatus];

  return matchedStatus?.styleClass ?? ORANGE;
};
