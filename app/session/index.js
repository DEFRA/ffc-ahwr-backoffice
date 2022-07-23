const entries = {
  appSearch: 'appSearch',
  viewApplication: 'viewApplication'
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

function getViewApplication (request, key) {
  return get(request, entries.viewApplication, key)
}

function setViewApplication (request, key, value) {
  set(request, entries.viewApplication, key, value)
}

module.exports = {
  setAppSearch,
  getAppSearch,
  setViewApplication,
  getViewApplication
}
