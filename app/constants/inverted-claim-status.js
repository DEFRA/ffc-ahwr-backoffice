import { CLAIM_STATUS } from "ffc-ahwr-common-library";

let cachedMap;

export const getInvertedClaimStatusMap = () => {
  if (cachedMap) {
    return cachedMap;
  }

  cachedMap = Object.entries(CLAIM_STATUS).reduce((map, [key, value]) => {
    map[value] = key;
    return map;
  }, {});

  return cachedMap;
};
