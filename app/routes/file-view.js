const { administrator, processor, user } = require('../auth/permissions')
const { filesContainer } = require('../config').storageConfig
const { listBlob, downloadBlob } = require('../lib/storage')

module.exports = [{
  method: 'GET',
  path: '/file-view',
  options: {
    auth: { scope: [administrator, processor, user] },
    handler: async (_, h) => {
      const blobs = await listBlob(filesContainer);
      const files = []
      for await (const blob of blobs) {
        files.push({ value: 'file', text: blob.name })
      }
      console.log(files)
      return h.view('file-view', {files})
    }
  }
},{
  method: 'POST',
  path: '/file-view',
  options: {
    auth: { scope: [administrator, processor, user] },
    handler: async (_, h) => {
      await downloadBlob(filesContainer, req.params.fileName);
      return h.view('file-view')
    }
  }
}]
