function ok ($) {
  expect($('.govuk-phase-banner').length).toEqual(1)
  expect($('.govuk-phase-banner').text()).toMatch('beta')
  expect($('.govuk-phase-banner').text()).toMatch('This is a new service - your feedback will help us to improve it.')
}

module.exports = {
  ok
}
