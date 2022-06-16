const { receiveMessage } = require('../../../app/messaging')
const { MessageReceiver } = require('ffc-messaging')
jest.genMockFromModule('ffc-messaging')
jest.mock('ffc-messaging')

const mockMessageReceiver = {
  acceptSession: jest.fn(),
  receiveMessages: jest.fn((_x, _y) => {
    return [
      {
        body: { }
      }
    ]
  }),
  completeMessage: jest.fn(),
  closeConnection: jest.fn()
}

MessageReceiver.mockImplementation(() => mockMessageReceiver)
describe('Receive Message test', () => {
  const messageId = '1234567890'
  const config = { abc: 'abc' }
  test('Call Receive return success', async () => {
    const result = await receiveMessage(messageId, config)
    expect(MessageReceiver).toBeCalled()
    expect(new MessageReceiver()).toStrictEqual(mockMessageReceiver)
    expect(mockMessageReceiver.receiveMessages).toBeCalled()
    expect(mockMessageReceiver.acceptSession).toBeCalledWith(messageId)
    expect(result).toStrictEqual({})
  })
})
