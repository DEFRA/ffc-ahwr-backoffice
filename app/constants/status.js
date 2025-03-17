const status = {
  AGREED: 1,
  WITHDRAWN: 2,
  IN_CHECK: 5,
  ACCEPTED: 6,
  NOT_AGREED: 7,
  PAID: 8,
  READY_TO_PAY: 9,
  REJECTED: 10,
  ON_HOLD: 11,
  RECOMMENDED_TO_PAY: 12,
  RECOMMENDED_TO_REJECT: 13,
  AUTHORISED: 14,
  SENT_TO_FINANCE: 15,
  PAYMENT_HELD: 16,
};

const statusStyle = {
  APPLIED: {
    styleClass: "govuk-tag--green",
  },
  AGREED: {
    styleClass: "govuk-tag--green",
  },
  WITHDRAWN: {
    styleClass: "govuk-tag--grey",
  },
  PAID: {
    styleClass: "govuk-tag--blue",
  },
  DATAINPUTTED: {
    styleClass: "govuk-tag--yellow",
  },
  REJECTED: {
    styleClass: "govuk-tag--red",
  },
  NOTAGREED: {
    styleClass: "govuk-tag--pink",
  },
  ACCEPTED: {
    styleClass: "govuk-tag--purple",
  },
  CHECK: {
    styleClass: "govuk-tag--orange",
  },
  CLAIMED: {
    styleClass: "govuk-tag--blue",
  },
  INCHECK: {
    styleClass: "govuk-tag--orange",
  },
  RECOMMENDEDTOPAY: {
    styleClass: "govuk-tag--orange",
  },
  RECOMMENDEDTOREJECT: {
    styleClass: "govuk-tag--orange",
  },
  READYTOPAY: {
    styleClass: "govuk-tag",
  },
  ONHOLD: {
    styleClass: "govuk-tag--purple",
  },
  SENTTOFINANCE: {
    styleClass: "govuk-tag--pink",
  },
};

const getStyleClassByStatus = (value) => {
  if (value === undefined) return "govuk-tag--orange";

  value = value.replace(/\s/g, "");
  const v = Object.keys(statusStyle).map((i) => i === value);
  if (v.filter((s) => s === true).length > 0) {
    return statusStyle[value].styleClass;
  } else {
    return "govuk-tag--orange";
  }
};

module.exports = { status, getStyleClassByStatus };
