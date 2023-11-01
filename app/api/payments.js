const Wreck = require('@hapi/wreck')
const { paymentApiUri } = require('../config')
async function getPayment (reference) {
  const url = `${paymentApiUri}/payment/${reference}`
  try {
    const response = await Wreck.get(url, { json: true })
    if (response.res.statusCode !== 200) {
      return null
    }
    return response.payload
  } catch (err) {
    console.log(err)
    return null
  }
}

module.exports = {
  getPayment
}
