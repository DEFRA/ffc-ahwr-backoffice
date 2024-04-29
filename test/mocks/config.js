jest.mock('../../app/config', () => ({
  ...jest.requireActual('../../app/config')
}))
const { endemics } = require('../../app/config')

const setEndemicsEnabled = (value) => {
  endemics.enabled = value
}

module.exports = {
  setEndemicsEnabled
}
