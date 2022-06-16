describe('Create Message test', () => {
  const createMessage = require('../../../app/messaging/create-message')

  test('Call createMessage return success', () => {
    const body = 'body'
    const type = 'type'
    const options = { abc: 'abc' }
    const message = createMessage(body, type, options)
    expect(message).not.toBeNull()
    expect(message).toEqual({
      body: body,
      type: type,
      source: 'ffc-ahwr-backoffice',
      ...options
    })
  })
})
