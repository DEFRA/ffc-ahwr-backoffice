const { administrator, processor, user } = require('../auth/permissions')
const { filesContainer } = require('../config').storageConfig
const { listBlob, downloadBlob } = require('../lib/storage')

module.exports = [{
  method: 'GET',
  path: '/file-view',
  options: {
    auth: { scope: [administrator, processor, user] },
    handler: async (_, h) => {
      const blobs = await listBlob(filesContainer)
      const files = []
      for await (const blob of blobs) {
        files.push({ value: blob.name, text: blob.name })
      }
      return h.view('file-view', { files })
    }
  }
}, {
  method: 'POST',
  path: '/file-view',
  options: {
    auth: { scope: [administrator, processor, user] },
    handler: async (req, h) => {
      const file = await downloadBlob(filesContainer, req.payload.files)
      return h.response(file)
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename= ' + req.payload.files)
    }
  }
}]
