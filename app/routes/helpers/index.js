// utils/route-helpers.js
const { Buffer } = require('buffer')

// Abstract redirect logic
function redirectWithError (h, claimOrApplication, reference, page, returnPage, error, errorMessage) {
  console.error(errorMessage, error.message) // Centralized error logging
  const encodedErrors = encodeURIComponent(Buffer.from(JSON.stringify(error)).toString('base64'))

  if (claimOrApplication === 'claim') {
    return h.redirect(`/view-claim/${reference}?approve=true${returnPage && '&returnPage=' + returnPage}&errors=${encodedErrors}`).takeover()
  } else {
    return h.redirect(`/view-agreement/${reference}?page=${page}&approve=true&errors=${encodedErrors}`).takeover()
  }
}

// Abstract redirect logic
function redirectRejectWithError (h, claimOrApplication, reference, page, returnPage, error, errorMessage) {
  console.error(errorMessage, error.message) // Centralized error logging
  const encodedErrors = encodeURIComponent(Buffer.from(JSON.stringify(error)).toString('base64'))

  if (claimOrApplication === 'claim') {
    return h.redirect(`/view-claim/${reference}?reject=true${returnPage && '&returnPage=' + returnPage}&errors=${encodedErrors}`).takeover()
  } else {
    return h.redirect(`/view-agreement/${reference}?page=${page}&reject=true&errors=${encodedErrors}`).takeover()
  }
}

function redirectToViewApplication (h, claimOrApplication, reference, page, returnPage) {
  if (claimOrApplication === 'claim') {
    return h.redirect(`/view-claim/${reference}${returnPage && '?returnPage=' + returnPage}`)
  } else {
    return h.redirect(`/view-agreement/${reference}?page=${page}`)
  }
}

// Export the helper functions
module.exports = { redirectWithError, redirectToViewApplication, redirectRejectWithError }
