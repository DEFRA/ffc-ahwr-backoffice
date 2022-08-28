const { BlobServiceClient } = require('@azure/storage-blob')
const { DefaultAzureCredential } = require('@azure/identity')
const { connectionString, useConnectionString, storageAccount } = require('../../config').storageConfig

const listBlob = async (container) => {
  let blobServiceClient
  if (useConnectionString === true) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  } else {
    const uri = `https://${storageAccount}.blob.core.windows.net`
    blobServiceClient = new BlobServiceClient(uri, new DefaultAzureCredential())
  }

  const client = blobServiceClient.getContainerClient(container)

  return client.listBlobsFlat();
}

module.exports = listBlob
