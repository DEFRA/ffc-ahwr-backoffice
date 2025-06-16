import { TYPE_OF_LIVESTOCK } from "ffc-ahwr-common-library";

const isSpecies = (typeOfLivestock, species) => {
  return typeOfLivestock === species;
};

export const getLivestockTypes = (typeOfLivestock) => {
  const { BEEF, DAIRY, PIGS, SHEEP } = TYPE_OF_LIVESTOCK;
  return {
    isBeef: isSpecies(typeOfLivestock, BEEF),
    isDairy: isSpecies(typeOfLivestock, DAIRY),
    isPigs: isSpecies(typeOfLivestock, PIGS),
    isSheep: isSpecies(typeOfLivestock, SHEEP),
  };
};
