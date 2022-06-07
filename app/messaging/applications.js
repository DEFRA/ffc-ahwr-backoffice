const { sendMessage, receiveMessage } = require('../messaging/index')
const { backOfficeRequestQueue, backOfficeResponseQueue, backOfficeRequestMsgType } = require('../config')

async function getApplications (searchType, searchText, limit, offset, sessionId) {
  await sendMessage({ search: { type: searchType, text: searchText, limit, offset } }, backOfficeRequestMsgType, backOfficeRequestQueue, { sessionId })
  return receiveMessage(sessionId, backOfficeResponseQueue)
}

module.exports = {
  getApplications
}
