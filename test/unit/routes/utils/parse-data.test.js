import { parseData } from "../../../../app/routes/utils/parse-data";
import { applicationEvents } from "../../../data/application-events.js";

describe("Parse data tests", () => {
  test("Parse data - Valid payload", async () => {
    const parsedData = parseData(applicationEvents.eventRecords, "claim-claimed", "claimed");

    expect(parsedData.value).toBeFalsy();
    expect(parsedData.raisedOn).toBe("2022-11-09T11:36:00.000Z");
    expect(parsedData.raisedBy).toBe("testuser@test.com");
  });

  test("Parse data - Empty payload", async () => {
    const parsedData = parseData(
      [
        {
          EventRaised: "2022-11-09T11:00:00.000Z",
          EventType: "claim-createdBy",
        },
        {
          EventRaised: "2022-11-01T11:00:01.000Z",
          EventType: "claim-claimed",
          Payload: "{}",
        },
      ],
      "claim-claimed",
      "claimed",
    );

    expect(parsedData.value).toBe("");
    expect(parsedData.raisedOn).toBe("");
    expect(parsedData.raisedBy).toBe("");
  });

  test("Parse data - No event", async () => {
    const parsedData = parseData(
      [
        {
          EventRaised: "2022-11-09T11:00:00.000Z",
          EventType: "claim-createdBy",
        },
      ],
      "claim-claimed",
      "claimed",
    );

    expect(parsedData.value).toBe("");
    expect(parsedData.raisedOn).toBe("");
    expect(parsedData.raisedBy).toBe("");
  });
});
