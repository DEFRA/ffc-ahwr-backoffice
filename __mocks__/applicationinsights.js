const appInsights = {
  defaultClient: {
    trackEvent: jest.fn(),
    trackException: jest.fn()
  }
}

module.exports = appInsights
