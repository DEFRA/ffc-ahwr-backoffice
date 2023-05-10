const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { applicationApiUri } = require('../../../app/config')
const { getAllStageConfigurations } = require('../../../app/api/stage-configuration')
describe('Stage Configuration API', () => {
  test('getAllStageConfigurations should return valid stage configuration array', async () => {
    const wreckResponse = {
      payload: {
        stageConfigurations: ['stage1', 'stage2']
      },
      res: {
        statusCode: 200
      }
    }
    const options = {
      json: true
    }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getAllStageConfigurations()
    expect(response).not.toBeNull()
    expect(response.stageConfigurations).toStrictEqual(['stage1', 'stage2'])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration`, options)
  })
})
