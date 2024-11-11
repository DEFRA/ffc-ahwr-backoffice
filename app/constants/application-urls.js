const { applicationApiUri } = require('../config')

module.exports.APPLICATION = `${applicationApiUri}/application`
module.exports.APPLICATION_CLAIM = `${applicationApiUri}/application/claim`
module.exports.APPLICATION_GET = `${applicationApiUri}/application/get`
module.exports.APPLICATION_SEARCH = `${applicationApiUri}/application/search`
module.exports.CLAIM_BY_REFERENCE = `${applicationApiUri}/claim/get-by-reference`
