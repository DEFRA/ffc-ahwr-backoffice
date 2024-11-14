const wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { applicationApiUri } = require('../../../app/config')
const { getAllStageConfigurations } = require('../../../app/api/stage-configuration')

describe('Stage Configuration API', () => {
  describe('getAllStageConfigurations', () => {
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
      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse)
      const response = await getAllStageConfigurations()

      expect(response).toEqual(wreckResponse.payload)
      expect(wreck.get).toHaveBeenCalledTimes(1)
      expect(wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration`, options)
    })
    test('getAllstageConfigurations should throw errors', async () => {
      const options = {
        json: true
      }
      wreck.get = jest.fn().mockRejectedValueOnce('configurations boom')
      const logger = { setBindings: jest.fn() }

      expect(async () => {
        await getAllStageConfigurations(logger)
      }).rejects.toBe('configurations boom')
      expect(wreck.get).toHaveBeenCalledTimes(1)
      expect(wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration`, options)
    })
  })
})
