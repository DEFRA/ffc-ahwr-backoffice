const { sendMessage } = require('../../../app/messaging')
const { MessageSender } = require('ffc-messaging')
const createMessage = require('../../../app/messaging/create-message')
jest.mock('../../../app/messaging/create-message')
jest.genMockFromModule('ffc-messaging')
jest.mock('ffc-messaging')

const mockMessageSender = {
  sendMessage: jest.fn(),
  closeConnection: jest.fn()
}

MessageSender.mockImplementation(() => mockMessageSender)
describe('Send Message test', () => {
  const body = 'body'
  const type = 'type'
  const options = { abc: 'abc' }
  test('Call Send return success', async () => {
    await sendMessage(body, type, {}, options)
    expect(MessageSender).toBeCalled()
    expect(new MessageSender()).toStrictEqual(mockMessageSender)
    expect(mockMessageSender.sendMessage).toBeCalled()
    expect(mockMessageSender.closeConnection).toBeCalled()
    expect(createMessage).toBeCalledWith(
      body,
      type,
      options
    )
  })
})
