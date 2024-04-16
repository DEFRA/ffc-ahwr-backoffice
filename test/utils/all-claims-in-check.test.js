const setAllClaimToInCheck = require('../../app/routes/utils/all-claims-in-check')

describe('setAllClaimToInCheck', () => {
  it('should set the statusId to 5', () => {
    const mockData = {
      statusId: 10
    }

    expect(setAllClaimToInCheck(mockData.statusId)).toBe(5)
  })
})
