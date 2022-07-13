function upperFirstLetter (str) {
  return str ? (str.charAt(0).toUpperCase() + str.slice(1)) : ''
}

function formatedDateToUk (date) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

module.exports = {
  upperFirstLetter,
  formatedDateToUk
}
