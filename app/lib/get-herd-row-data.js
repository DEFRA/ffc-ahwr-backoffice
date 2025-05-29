const { upperFirstLetter } = require("./display-helper");
const { getHerdReasonsText } = require("./get-herd-reasons-text");

const getHerdRowData = (herd, isSheep) => {
  const flockOrHerdWord = isSheep ? "flock" : "herd";

  const herdInfo = herd ?? {
    herdName: `Unnamed ${flockOrHerdWord}`,
    cph: "-",
  };
  const isOnlyHerd = herdInfo.herdReasons?.includes("onlyHerd") ? "Yes" : "No";
  const reasonText = getHerdReasonsText(herdInfo.herdReasons);
  const herdName = {
    key: { text: `${upperFirstLetter(flockOrHerdWord)} name` },
    value: {
      html: herdInfo.herdName ?? `Unnamed ${flockOrHerdWord}`,
    },
  };
  const herdCph = {
    key: { text: `${upperFirstLetter(flockOrHerdWord)} CPH` },
    value: { html: herdInfo.cph },
  };
  const otherHerdsOnSbi = {
    key: { text: `Is this the only ${flockOrHerdWord} on this SBI?` },
    value: { html: herdInfo.herdReasons ? isOnlyHerd : "-" },
  };
  const reasonsForHerd = {
    key: { text: `Reasons the ${flockOrHerdWord} is separate` },
    value: {
      html: reasonText,
    },
  };

  return [herdName, herdCph, otherHerdsOnSbi, reasonsForHerd];
};

module.exports = { getHerdRowData };
