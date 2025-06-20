export const getOrganisationDetails = (organisation, contactHistoryDetails) => {
  return [
    {
      field: "Agreement holder",
      newValue: organisation.farmerName,
      oldValue: contactHistoryDetails.farmerName,
    },
    { field: "SBI number", newValue: organisation.sbi, oldValue: null },
    {
      field: "Address",
      newValue: organisation.address,
      oldValue: contactHistoryDetails.address,
    },
    {
      field: "Email address",
      newValue: organisation.email,
      oldValue: contactHistoryDetails.email,
    },
    {
      field: "Organisation email address",
      newValue: organisation.orgEmail,
      oldValue: contactHistoryDetails.orgEmail,
    },
  ];
};
