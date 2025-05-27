const { multiHerdsEnabled } = require("../config");

const getHerdBreakdown = (claims) => {
  if (!multiHerdsEnabled) {
    return undefined;
  }

  const initialBreakdown = { beef: 0, sheep: 0, dairy: 0, pigs: 0 };
  const speciesAlreadyCountedFromNoHerd = new Set();

  // Only increase the herd count *once* per unnamed herd
  for (const claim of claims) {
    if (claim.herd) {
      const species = claim.herd.species;
      initialBreakdown[species]++;
    } else {
      const species = claim.data.typeOfLivestock;

      if (!speciesAlreadyCountedFromNoHerd.has(species)) {
        initialBreakdown[species]++;
        speciesAlreadyCountedFromNoHerd.add(species);
      }
    }
  }

  return { herdBreakdown: initialBreakdown };
};

module.exports = {
  getHerdBreakdown,
};
