export const applicationEvents = {
  eventRecords: [
    {
      EventRaised: "2022-11-09T11:00:00.000Z",
      EventType: "claim-createdBy",
    },
    {
      EventRaised: "2022-11-01T11:00:01.000Z",
      EventType: "claim-claimed",
      Payload:
        '{"type":"claim-claimed","message":"Session set for claim and claimed.","data":{"claimed":false},"raisedBy":"testuser@test.com","raisedOn":"2022-11-02T13:00:01.000Z"}',
    },
    {
      EventRaised: "2022-11-09T11:00:02.000Z",
      EventType: "claim-claimed",
      Payload:
        '{"type":"claim-claimed","message":"Session set for claim and claimed.","data":{"claimed":false},"raisedBy":"testuser@test.com","raisedOn":"2022-11-09T11:36:00.000Z"}',
    },
  ],
};
