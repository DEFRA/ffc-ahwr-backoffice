const Wreck = require('@hapi/wreck')
const { paymentApiUri } = require('../config')
async function getPayments (reference) {
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
async function postPayment (payload) {
  const url = `${paymentApiUri}/payment`
  const options = {
    payload,
    json: true
  }
  try {
    const response = await Wreck.post(url, options)
    if (response.res.statusCode !== 200) {
      return { payments: [], total: 0 }
    }
    return response.payload
  } catch (err) {
    console.log(err)
    return { payments: [], total: 0 }
  }
}
module.exports = {
  getPayments,
  postPayment
}
