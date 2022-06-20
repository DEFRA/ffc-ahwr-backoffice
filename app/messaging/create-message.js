const createMessage = (body, type, options) => {
  return {
    body,
    type,
    source: 'ffc-ahwr-backoffice',
    ...options
  }
}

module.exports = createMessage
