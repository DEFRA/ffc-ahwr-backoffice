function upperFirstLetter(str) {
  return typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function formattedDateToUk(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatSpecies(species) {
  return {
    beef: "Beef cattle",
    dairy: "Dairy cattle",
    sheep: "Sheep",
    pigs: "Pigs",
  }[species];
}

function formatStatusId(statusId) {
  return {
    1: "AGREED",
    2: "WITHDRAWN",
    4: "CLAIMED",
    5: "IN CHECK",
    6: "ACCEPTED",
    7: "NOT AGREED",
    8: "PAID",
    9: "READY TO PAY",
    10: "REJECTED",
    11: "ON HOLD",
    12: "RECOMMENDED TO PAY",
    13: "RECOMMENDED TO REJECT",
    14: "AUTHORISED",
    15: "SENT TO FINANCE",
    16: "PAYMENT HELD",
  }[statusId];
}

function formatTypeOfVisit(typeOfVisit) {
  if (typeOfVisit === undefined) return;

  return typeOfVisit === "E" ? "Endemics" : "Review";
}

module.exports = {
  upperFirstLetter,
  formattedDateToUk,
  formatSpecies,
  formatTypeOfVisit,
  formatStatusId,
};
