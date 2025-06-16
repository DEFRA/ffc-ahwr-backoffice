import { CLAIM_STATUS } from "ffc-ahwr-common-library";

export const upperFirstLetter = (str) => {
  return typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : "";
};

export const formattedDateToUk = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatSpecies = (species) => {
  return {
    beef: "Beef cattle",
    dairy: "Dairy cattle",
    sheep: "Sheep",
    pigs: "Pigs",
  }[species];
};

export const formatStatusId = (statusId) => {
  const newMap = {};

  for (const key in CLAIM_STATUS) {
    const value = CLAIM_STATUS[key];
    newMap[value] = key;
  }

  if (!newMap[statusId]) {
    return;
  }

  return newMap[statusId].replace(/_/g, " ");
};

export const formatTypeOfVisit = (typeOfVisit) => {
  if (typeOfVisit === undefined) return;

  return typeOfVisit === "E" ? "Endemics" : "Review";
};
