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

module.exports = { failActionTwoCheckboxes }
