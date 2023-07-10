const parsePayload = (events, eventType) => {
  const eventData = events.filter(event => event.EventType.startsWith(eventType))
  const latestEvent = eventData.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  return latestEvent?.Payload ? JSON.parse(latestEvent?.Payload) : {}
}

const parseData = (events, type, key) => {
  let value = ''
  let raisedOn = ''
  let raisedBy = ''
  const data = parsePayload(events, type)

  try {
    value = data?.data[key]
    raisedOn = data?.raisedOn
    raisedBy = data?.raisedBy
  } catch (error) {
    console.log(`${key} not found`)
  }

  return {
    value,
    raisedOn,
    raisedBy
  }
}

module.exports = {
  parsePayload,
  parseData
}
