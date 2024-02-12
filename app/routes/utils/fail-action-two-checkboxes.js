const failActionTwoCheckboxes = async (error, panel) => {
  const checkboxErrors = []
  if (error.details && error.details[0].context.key === 'confirm') {
    checkboxErrors.push({
      text: 'Select both checkboxes',
      href: `#${panel}`
    })
  }
  return checkboxErrors
}

const failActionConsoleLog = async (request, error, routeForLog) => {
  console.log(`routes:${routeForLog}: Error when validating payload: ${JSON.stringify({
    errorMessage: error.message,
    payload: request.payload
  })}`)
}

module.exports = { failActionConsoleLog, failActionTwoCheckboxes }
