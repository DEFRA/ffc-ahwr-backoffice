const wreck = require("@hapi/wreck");
const { applicationApiUri } = require("../config");
const { fieldsNames, labels, notAvailable } = require("./../constants/contact-history");

async function getContactHistory(reference, logger) {
  const endpoint = `${applicationApiUri}/application/contact-history/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });

    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

const getContactFieldData = (contactHistoryData, field) => {
  const filteredData = contactHistoryData.filter((contact) => contact.data?.field === field);

  if (filteredData.length === 0) {
    return "NA";
  }

  const [firstUpdate] = filteredData.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return `${labels[field]} ${firstUpdate.data.oldValue}`;
};

const displayContactHistory = (contactHistory) => {
  if (contactHistory) {
    const orgEmail = getContactFieldData(contactHistory, fieldsNames.orgEmail);
    const email = getContactFieldData(contactHistory, fieldsNames.email);
    const farmerName = getContactFieldData(contactHistory, fieldsNames.farmerName);
    const address = getContactFieldData(contactHistory, fieldsNames.address);
    return {
      orgEmail,
      email,
      farmerName,
      address,
    };
  } else {
    return {
      orgEmail: notAvailable,
      email: notAvailable,
      farmerName: notAvailable,
      address: notAvailable,
    };
  }
};

module.exports = {
  getContactHistory,
  displayContactHistory,
};
