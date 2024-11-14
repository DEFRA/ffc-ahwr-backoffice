const wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { applicationApiUri } = require('../../../app/config')
const { getStageExecutionByApplication, addStageExecution, updateStageExecution } = require('../../../app/api/stage-execution')

const payload = {
  applicationReference: 'AHWR-0000-0000',
  stageConfigurationId: 2,
  executedBy: 'Mr User',
  processedAt: null
}

describe('Stage Execution API', () => {
  describe('getStageExecutionByApplication', () => {
    test('getStageExecutionByApplication should return valid stage execution array', async () => {
      const wreckResponse = {
        payload: {
          stageExecutions: ['stage1', 'stage2']
        },
        res: {
          statusCode: 200
        }
      }
      const options = {
        json: true
      }
      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse)
      const response = await getStageExecutionByApplication('AHWR-0000-0000')

      expect(response).toEqual(wreckResponse.payload)
      expect(wreck.get).toHaveBeenCalledTimes(1)
      expect(wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/AHWR-0000-0000`, options)
    })

    test('getStageExecutionByApplication should return empty array if non exist', async () => {
      const wreckResponse = {
        output: {
          statusCode: 404
        }
      }
      const options = {
        json: true
      }
      wreck.get = jest.fn().mockRejectedValueOnce(wreckResponse)
      const logger = { setBindings: jest.fn() }
      const response = await getStageExecutionByApplication('AHWR-0000-0000', logger)

      expect(response).toEqual([])
      expect(wreck.get).toHaveBeenCalledTimes(1)
      expect(wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/AHWR-0000-0000`, options)
    })

    test('getStageExecutionByApplication should throw errors', async () => {
      const wreckResponse = {
        output: {
          statusCode: 500
        }
      }
      const options = {
        json: true
      }
      wreck.get = jest.fn().mockRejectedValueOnce(wreckResponse)
      const logger = { setBindings: jest.fn() }

      expect(async () => {
        await getStageExecutionByApplication('AHWR-0000-0000', logger)
      }).rejects.toEqual(wreckResponse)
      expect(wreck.get).toHaveBeenCalledTimes(1)
      expect(wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/AHWR-0000-0000`, options)
    })
  })

  describe('addStageExecution', () => {
    test('addStageExecution should return stage execution', async () => {
      const wreckResponse = {
        payload: {
          stageExecution: 'stage1'
        },
        res: {
          statusCode: 200
        }
      }
      const options = {
        payload,
        json: true
      }
      wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse)
      const response = await addStageExecution(payload)

      expect(response).toEqual(wreckResponse.payload)
      expect(wreck.post).toHaveBeenCalledTimes(1)
      expect(wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
    })

    test('addStageExecution should throw errors', async () => {
      const options = {
        payload,
        json: true
      }
      wreck.post = jest.fn().mockRejectedValueOnce('add execution boom')
      const logger = { setBindings: jest.fn() }

      expect(async () => {
        await addStageExecution(payload, logger)
      }).rejects.toBe('add execution boom')
      expect(wreck.post).toHaveBeenCalledTimes(1)
      expect(wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
    })
  })

  describe('updateStageExecution', () => {
    test('updateStageExecution should return valid stage execution', async () => {
      const wreckResponse = {
        payload: {
          stageExecution: 'stage1'
        },
        res: {
          statusCode: 200
        }
      }
      const options = {
        json: true
      }
      wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse)
      const response = await updateStageExecution(2)

      expect(response).toBe(wreckResponse.payload)
      expect(wreck.put).toHaveBeenCalledTimes(1)
      expect(wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/2`, options)
    })

    test('updateStageExecution should throw errors', async () => {
      const options = {
        json: true
      }
      wreck.put = jest.fn().mockRejectedValueOnce('update execution boom')
      const logger = { setBindings: jest.fn() }
      expect(async () => {
        await updateStageExecution(2, logger)
      }).rejects.toBe('update execution boom')

      expect(wreck.put).toHaveBeenCalledTimes(1)
      expect(wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/2`, options)
    })
  })
})
