
const container = 'container'
const file = 'file'
let storageBlobMock

storageBlobMock = require('@azure/storage-blob')
jest.mock('@azure/storage-blob', () => {
  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn().mockImplementation(() => {
        return {
          getContainerClient: jest.fn().mockImplementation(() => {
            return {
              exists: jest.fn().mockResolvedValueOnce(false),
              listBlobsFlat: jest.fn().mockResolvedValueOnce([{ name: 'fakeFile.pdf' }])
            }
          })
        }
      })
    }
  }
})
const blobServiceClientMock = storageBlobMock.BlobServiceClient

const { downloadBlob, listBlob } = require('../../../../app/lib/storage/index')

describe('Download blob tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test('creates client using connection string', async () => {
    await downloadBlob(container, file)

    expect(blobServiceClientMock.fromConnectionString).toHaveBeenCalledTimes(1)
  })

  test('creates client using connection string', async () => {
    const response = await downloadBlob(container, file)

    expect(blobServiceClientMock.fromConnectionString).toHaveBeenCalledTimes(1)
    expect(response).toBeUndefined()
  })

  test('list blob', async () => {
    const response = await listBlob(container, file)

    expect(blobServiceClientMock.fromConnectionString).toHaveBeenCalledTimes(1)
    expect(response).toEqual([{ name: 'fakeFile.pdf' }])
  })

  test('creates client using connection string', async () => {
    storageBlobMock = require('@azure/storage-blob')
    jest.mock('@azure/storage-blob', () => {
      return {
        BlobServiceClient: {
          fromConnectionString: jest.fn().mockImplementation(() => {
            return {
              getContainerClient: jest.fn().mockImplementation(() => {
                return {
                  exists: jest.fn().mockResolvedValueOnce(true),
                  getBlockBlobClient: jest.fn().mockImplementation(() => {
                    return {
                      downloadToBuffer: jest.fn().mockResolvedValue('contents of file')
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
    const { downloadBlob } = require('../../../../app/lib/storage/index')
    const response = await downloadBlob(container, file)
    expect(storageBlobMock.BlobServiceClient.fromConnectionString).toHaveBeenCalledTimes(1)
    expect(response).toBe('contents of file')
  })
})
