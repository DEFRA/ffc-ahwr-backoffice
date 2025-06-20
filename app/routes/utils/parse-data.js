export const parsePayload = (events, eventType) => {
  const eventData = events.filter((event) => event.EventType.startsWith(eventType));
  const latestEvent = eventData.sort(
    (a, b) => new Date(b.EventRaised) - new Date(a.EventRaised),
  )[0];
  return latestEvent?.Payload ? JSON.parse(latestEvent?.Payload) : {};
};

export const parseData = (events, type, key) => {
  const { data, raisedOn = "", raisedBy = "" } = parsePayload(events, type);

  return {
    value: data?.[key] || "",
    raisedOn,
    raisedBy,
  };
};
