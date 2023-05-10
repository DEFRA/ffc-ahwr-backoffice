const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
jest.mock('../../../app/config')
const { applicationApiUri } = require('../../../app/config')
const { getAllStageExecutions, addStageExecution, updateStageExecution } = require('../../../app/api/stage-execution')

const payload = {
  applicationReference: 'AHWR-0000-0000',
  stageConfigurationId: 2,
  executedBy: 'Mr User',
  processedAt: null
}

describe('Stage Execution API', () => {
  let logSpy

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log')
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  describe('getAllStageExecutions', () => {
    test('getAllStageExecutions should return valid stage execution array', async () => {
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
      Wreck.get = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await getAllStageExecutions()
      expect(response).not.toStrictEqual([])
      expect(response.stageExecutions).toStrictEqual(['stage1', 'stage2'])
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
    })
    test('getAllStageExecutions should return null', async () => {
      const wreckResponse = {
        payload: {
          stageExecutions: ['stage1', 'stage2']
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
      const response = await getAllStageExecutions()
      expect(response).toStrictEqual([])
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
    })
    test('getAllStageExecutions should return null when error thrown', async () => {
      const options = {
        json: true
      }
      Wreck.get = jest.fn(async function (_url, _options) {
        throw new Error('Error')
      })
      const response = await getAllStageExecutions()
      expect(response).toStrictEqual([])
      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy).toHaveBeenNthCalledWith(1, 'Application API: Getting all stage executions')
      expect(logSpy).toHaveBeenNthCalledWith(2, 'Application API: Error while getting all stage executions: Error')
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
    })
  })
  describe('addStageExecution', () => {
    test('addStageExecution should return valid stage execution array', async () => {
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
      Wreck.post = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await addStageExecution(payload)
      expect(response).not.toStrictEqual([])
      expect(response.stageExecution).toStrictEqual('stage1')
      expect(Wreck.post).toHaveBeenCalledTimes(1)
      expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
    })
    test('addStageExecution should return null', async () => {
      const wreckResponse = {
        payload: {
          stageExecution: 'stage1'
        },
        res: {
          statusCode: 404
        }
      }
      const options = {
        payload,
        json: true
      }
      Wreck.post = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await addStageExecution(payload)
      expect(response).toStrictEqual([])
      expect(Wreck.post).toHaveBeenCalledTimes(1)
      expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
    })
    test('addStageExecution should return null when error thrown', async () => {
      const options = {
        payload,
        json: true
      }
      Wreck.post = jest.fn(async function (_url, _options) {
        throw new Error('Error')
      })
      const response = await addStageExecution(payload)
      expect(response).toStrictEqual([])
      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy).toHaveBeenNthCalledWith(1, `Application API: Adding stage execution, ${JSON.stringify(payload)}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, 'Application API: Error while adding stage execution: Error')
      expect(Wreck.post).toHaveBeenCalledTimes(1)
      expect(Wreck.post).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution`, options)
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
      Wreck.put = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await updateStageExecution(2)
      expect(response).not.toStrictEqual([])
      expect(response.stageExecution).toStrictEqual('stage1')
      expect(Wreck.put).toHaveBeenCalledTimes(1)
      expect(Wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/2`, options)
    })
    test('updateStageExecution should return null', async () => {
      const wreckResponse = {
        payload: {
          stageExecution: 'stage1'
        },
        res: {
          statusCode: 404
        }
      }
      const options = {
        json: true
      }
      Wreck.put = jest.fn(async function (_url, _options) {
        return wreckResponse
      })
      const response = await updateStageExecution(2)
      expect(response).toStrictEqual([])
      expect(Wreck.put).toHaveBeenCalledTimes(1)
      expect(Wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/2`, options)
    })
    test('updateStageExecution should return null when error thrown', async () => {
      const options = {
        json: true
      }
      Wreck.put = jest.fn(async function (_url, _options) {
        throw new Error('Error')
      })
      const response = await updateStageExecution(2)
      expect(response).toStrictEqual([])
      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy).toHaveBeenNthCalledWith(1, 'Application API: Updating stage execution 2')
      expect(logSpy).toHaveBeenNthCalledWith(2, 'Application API: Error while updating stage execution: Error')
      expect(Wreck.put).toHaveBeenCalledTimes(1)
      expect(Wreck.put).toHaveBeenCalledWith(`${applicationApiUri}/stageexecution/2`, options)
    })
  })
})
