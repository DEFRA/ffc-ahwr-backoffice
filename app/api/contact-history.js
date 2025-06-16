import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { contactHistory } from "./../constants/contact-history.js";

const { fieldsNames, labels, notAvailable } = contactHistory;
const { applicationApiUri } = config;

export async function getContactHistory(reference, logger) {
  const endpoint = `${applicationApiUri}/application/contact-history/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });

    return payload;
  } catch (err) {
    logger.setBindings({ err, endpoint });
    throw err;
  }
}

export const getContactFieldData = (contactHistoryData, field) => {
  const filteredData = contactHistoryData.filter((contact) => contact.data?.field === field);

  if (filteredData.length === 0) {
    return "NA";
  }

  const [firstUpdate] = filteredData.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return `${labels[field]} ${firstUpdate.data.oldValue}`;
};

export const displayContactHistory = (contactHistory) => {
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
