const { sendMessage, receiveMessage } = require('../messaging/index')
const { backOfficeRequestQueue, backOfficeResponseQueue, backOfficeRequestMsgType, getApplicationRequestMsgType } = require('../config')

async function getApplications (searchType, searchText, limit, offset, sessionId) {
  await sendMessage({ search: { type: searchType, text: searchText }, limit, offset }, backOfficeRequestMsgType, backOfficeRequestQueue, { sessionId })
  return receiveMessage(sessionId, backOfficeResponseQueue)
}

async function getApplication (reference, sessionId) {
  await sendMessage({ reference }, getApplicationRequestMsgType, backOfficeRequestQueue, { sessionId })
  return receiveMessage(sessionId, backOfficeResponseQueue)
}

module.exports = {
  getApplications,
  getApplication
}
