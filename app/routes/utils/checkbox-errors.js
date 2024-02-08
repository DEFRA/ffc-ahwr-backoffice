const checkboxErrors = (errors, panel) => {
  return errors.map(e => e.href).includes(`#${panel}`)
    ? { text: 'Select both checkboxes' }
    : undefined
}

module.exports = checkboxErrors
