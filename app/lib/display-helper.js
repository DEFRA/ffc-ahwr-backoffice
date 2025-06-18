import { getInvertedClaimStatusMap } from "../constants/inverted-claim-status.js";

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
  const invertedClaimStatusMap = getInvertedClaimStatusMap();

  return invertedClaimStatusMap[statusId].replace(/_/g, " ");
};

export const formatTypeOfVisit = (typeOfVisit) => {
  return typeOfVisit === "E" ? "Endemics" : "Review";
};
