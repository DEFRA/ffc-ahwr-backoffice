const entries = {
  appSearch: "appSearch",
  claimSearch: "claimSearch",
  userDetails: "userDetails",
};

function set(request, entryKey, key, value) {
  const entryValue = request.yar.get(entryKey) || {};
  entryValue[key] = typeof value === "string" ? value.trim() : value;
  request.yar.set(entryKey, entryValue);
}

function get(request, entryKey, key) {
  return key ? request.yar.get(entryKey)?.[key] : request.yar.get(entryKey);
}

export function setAppSearch(request, key, value) {
  set(request, entries.appSearch, key, value);
}

export function getAppSearch(request, key) {
  return get(request, entries.appSearch, key);
}

export function setClaimSearch(request, key, value) {
  set(request, entries.claimSearch, key, value);
}

export function getClaimSearch(request, key) {
  return get(request, entries.claimSearch, key);
}

export function setUserDetails(request, key, value) {
  set(request, entries.userDetails, key, value);
}

export function getUserDetails(request, key) {
  return get(request, entries.userDetails, key);
}
