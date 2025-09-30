import { getApplicationClaimDetails } from "../../../../../app/routes/models/application-claim.js";
import { viewApplicationData } from "../../../../data/view-applications.js";
import { applicationEvents } from "../../../../data/application-events.js";

describe("Application-claim model", () => {
  test("getClaimData - Valid Data with date of claim in application data", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      viewApplicationData.claim,
      [],
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag--blue">Claimed</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: { text: "07/11/2022" },
        actions: visitDateActions,
      },
      { key: { text: "Date of testing" }, value: { text: "08/11/2022" } },
      { key: { text: "Date of claim" }, value: { text: "09/11/2022" } },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: "testVet" },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: "1234234" },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: "134242" },
      },
    ]);
  });

  test("getClaimData - Valid Data with date of claim in events data", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      viewApplicationData.claimWithNoClaimDate,
      applicationEvents,
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag--blue">Claimed</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: { text: "07/11/2022" },
        actions: visitDateActions,
      },
      { key: { text: "Date of testing" }, value: { text: "08/11/2022" } },
      { key: { text: "Date of claim" }, value: { text: "09/11/2022" } },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: "testVet" },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: "1234234" },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: "134242" },
      },
    ]);
  });

  test("getClaimData - Valid Data with no date of claim", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      viewApplicationData.claimWithNoClaimDate,
      [],
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );
    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag--blue">Claimed</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: { text: "07/11/2022" },
        actions: visitDateActions,
      },
      { key: { text: "Date of testing" }, value: { text: "08/11/2022" } },
      { key: { text: "Date of claim" }, value: { text: "" } },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: "testVet" },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: "1234234" },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: "134242" },
      },
    ]);
  });

  test("getClaimData - Valid Data with no date of testing", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      viewApplicationData.claimWithNoDateOfTesting,
      [],
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag--blue">Claimed</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: { text: "07/11/2022" },
        actions: visitDateActions,
      },
      { key: { text: "Date of testing" }, value: { text: "Invalid Date" } },
      { key: { text: "Date of claim" }, value: { text: "" } },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: "testVet" },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: "1234234" },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: "134242" },
      },
    ]);
  });

  test("getClaimData - Valid Data with no claim-claimed event", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      viewApplicationData.claimWithNoClaimDate,
      {
        eventRecords: [
          {
            EventRaised: "2022-11-09T11:00:00.000Z",
            EventType: "claim-createdBy",
          },
        ],
      },
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag--blue">Claimed</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: { text: "07/11/2022" },
        actions: visitDateActions,
      },
      { key: { text: "Date of testing" }, value: { text: "08/11/2022" } },
      { key: { text: "Date of claim" }, value: { text: "" } },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: "testVet" },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: "1234234" },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: "134242" },
      },
    ]);
  });

  test("getClaimData - Data returned for paid status", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      viewApplicationData.paid,
      {
        eventRecords: [
          {
            EventRaised: "2022-11-09T11:00:00.000Z",
            EventType: "claim-createdBy",
          },
        ],
      },
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag--blue">Paid</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: { text: "Invalid Date" },
        actions: visitDateActions,
      },
      { key: { text: "Date of testing" }, value: { text: "Invalid Date" } },
      { key: { text: "Date of claim" }, value: { text: "08/11/2022" } },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: undefined },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: undefined },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: undefined },
      },
    ]);
  });
});
