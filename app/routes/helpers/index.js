// utils/route-helpers.js
const { Buffer } = require('buffer')

// Abstract redirect logic
function redirectWithError (h, reference, page, error, errorMessage) {
  console.error(errorMessage, error.message) // Centralized error logging
  const encodedErrors = encodeURIComponent(Buffer.from(JSON.stringify(error)).toString('base64'))
  return h.redirect(`/view-application/${reference}?page=${page}&approve=true&errors=${encodedErrors}`).takeover()
}

// Abstract redirect logic
function redirectRejectWithError (h, reference, page, error, errorMessage) {
  console.error(errorMessage, error.message) // Centralized error logging
  const encodedErrors = encodeURIComponent(Buffer.from(JSON.stringify(error)).toString('base64'))
  return h.redirect(`/view-application/${reference}?page=${page}&reject=true&errors=${encodedErrors}`).takeover()
}

function redirectToViewApplication (h, reference, page) {
  return h.redirect(`/view-application/${reference}?page=${page}`)
}

// Export the helper functions
module.exports = { redirectWithError, redirectToViewApplication, redirectRejectWithError }
