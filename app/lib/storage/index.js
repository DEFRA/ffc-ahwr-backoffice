const { BlobServiceClient } = require('@azure/storage-blob')
const { DefaultAzureCredential } = require('@azure/identity')
const { connectionString, useConnectionString, storageAccount } = require('../../config').storageConfig

const getClient = () => {
  if (useConnectionString === true) {
    return BlobServiceClient.fromConnectionString(connectionString)
  }
  const uri = `https://${storageAccount}.blob.core.windows.net`
  return new BlobServiceClient(uri, new DefaultAzureCredential())
}

const listBlob = async (container) => {
  const blobServiceClient = getClient()
  const client = blobServiceClient.getContainerClient(container)

  return client.listBlobsFlat();
}

const downloadBlob = async (container, fileName) => {
  const blobServiceClient = getClient()
  const containerClient = blobServiceClient.getContainerClient(container)
  if (await containerClient.exists()) {
    try {
      const blob = containerClient.getBlockBlobClient(fileName)
      return blob.downloadToBuffer()
    } catch (e) {
      console.error(e)
    }
  }
  return undefined
}

module.exports = { listBlob, downloadBlob }
