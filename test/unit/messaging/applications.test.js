describe('Application Messaging test', () => {
  const messagingMock = require('../../../app/messaging')
  jest.mock('../../../app/messaging')
  messagingMock.receiveMessage.mockReturnThis()
  messagingMock.sendMessage.mockReturnThis()

  const application = require('../../../app/messaging/applications')
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Call Get Application return success', async () => {
    await application.getApplication()
    expect(messagingMock.receiveMessage).toBeCalledTimes(1)
    expect(messagingMock.sendMessage).toBeCalledTimes(1)
  })

  test('Call Get getApplications return success', async () => {
    await application.getApplications()
    expect(messagingMock.receiveMessage).toBeCalledTimes(1)
    expect(messagingMock.sendMessage).toBeCalledTimes(1)
  })
})
