const prepareValidationErrors = (joiErrors, href) => {
  const errors = joiErrors.map((error) => ({
    text: error.message,
    href,
    key: error.context.key
  }))

  return Buffer
    .from(JSON.stringify(errors))
    .toString('base64')
}

module.exports = { prepareValidationErrors }
