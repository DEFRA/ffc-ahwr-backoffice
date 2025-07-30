export const getHerdBreakdown = (claims) => {
  const initialBreakdown = { beef: 0, sheep: 0, dairy: 0, pigs: 0 };
  const countedHerdIds = new Set();
  const countedSpeciesWithoutHerd = new Set();

  for (const claim of claims) {
    if (claim.herd) {
      const { id: herdId, species } = claim.herd;

      if (!countedHerdIds.has(herdId)) {
        countedHerdIds.add(herdId);
        initialBreakdown[species]++;
      }
    } else {
      const species = claim.data.typeOfLivestock;

      if (!countedSpeciesWithoutHerd.has(species)) {
        countedSpeciesWithoutHerd.add(species);
        initialBreakdown[species]++;
      }
    }
  }

  return { herdBreakdown: initialBreakdown };
};
