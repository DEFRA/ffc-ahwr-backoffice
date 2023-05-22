const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { applicationApiUri } = require('../../../app/config')
const { getAllStageConfigurations, getStageConfigurationById } = require('../../../app/api/stage-configuration')

describe('Stage Configuration API', () => {
  let logSpy

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log')
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  describe('getStageConfigurationById', () => {
    test('getStageConfigurationById should return valid stage configuration array', async () => {
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
      const response = await getStageConfigurationById(1)
      expect(response).not.toStrictEqual([])
      expect(response.stageConfigurations).toStrictEqual(['stage1', 'stage2'])
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration/1`, options)
    })
    test('getstageConfigurationsById should return null', async () => {
      const wreckResponse = {
        payload: {
          stageConfigurations: ['stage1', 'stage2']
        },
        res: {
          statusCode: 404
        }
      }
      const options = {
        json: true
      }
      Wreck.get = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await getStageConfigurationById(1)
      expect(response).toStrictEqual([])
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration/1`, options)
    })
    test('getstageConfigurationsById should return null when error thrown', async () => {
      const options = {
        json: true
      }
      Wreck.get = jest.fn(async function (_url, _options) {
        throw new Error('Error')
      })
      const response = await getStageConfigurationById(1)
      expect(response).toStrictEqual([])
      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy).toHaveBeenNthCalledWith(1, 'Application API: Getting stage configurations by id 1')
      expect(logSpy).toHaveBeenNthCalledWith(2, 'Application API: Error while getting stage configuration by id: Error')
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration/1`, options)
    })
  })

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
      Wreck.get = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await getAllStageConfigurations()
      expect(response).not.toStrictEqual([])
      expect(response.stageConfigurations).toStrictEqual(['stage1', 'stage2'])
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration`, options)
    })
    test('getAllstageConfigurations should return null', async () => {
      const wreckResponse = {
        payload: {
          stageConfigurations: ['stage1', 'stage2']
        },
        res: {
          statusCode: 404
        }
      }
      const options = {
        json: true
      }
      Wreck.get = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await getAllStageConfigurations()
      expect(response).toStrictEqual([])
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration`, options)
    })
    test('getAllstageConfigurations should return null when error thrown', async () => {
      const options = {
        json: true
      }
      Wreck.get = jest.fn(async function (_url, _options) {
        throw new Error('Error')
      })
      const response = await getAllStageConfigurations()
      expect(response).toStrictEqual([])
      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(logSpy).toHaveBeenCalledWith('Application API: Error while getting all stage configurations: Error')
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageconfiguration`, options)
    })
  })
})
