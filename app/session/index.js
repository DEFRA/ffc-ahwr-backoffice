const entries = {
  appSearch: 'appSearch',
  applicationFraudCheck: 'viewApplicationPayment',
  applicationPayment: 'viewApplicationPayment'
}

function set (request, entryKey, key, value) {
  const entryValue = request.yar?.get(entryKey) || {}
  entryValue[key] = typeof (value) === 'string' ? value.trim() : value
  request.yar.set(entryKey, entryValue)
}

function get (request, entryKey, key) {
  return key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)
}

function setAppSearch (request, key, value) {
  set(request, entries.appSearch, key, value)
}

function getAppSearch (request, key) {
  return get(request, entries.appSearch, key)
}

function getApplicationFraudCheck (request, key) {
  return get(request, entries.applicationFraudCheck, key)
}

function setApplicationFraudCheck (request, key, value) {
  set(request, entries.applicationFraudCheck, key, value)
}

function getApplicationPayment (request, key) {
  return get(request, entries.applicationPayment, key)
}

function setApplicationPayment (request, key, value) {
  set(request, entries.applicationPayment, key, value)
}

module.exports = {
  setAppSearch,
  getAppSearch,
  getApplicationFraudCheck,
  setApplicationFraudCheck,
  getApplicationPayment,
  setApplicationPayment
}
