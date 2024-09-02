const splitDateString = (dateString) => {
  if (typeof dateString !== 'string') {
    throw new Error('dateString must be a string')
  }

  const dateParts = dateString.split('/')

  if (dateParts.length !== 3) {
    throw new Error('dateString must contain 3 parts separated by / eg. 01/01/2021')
  }
  console.log('dateParts', dateParts)

  return dateParts
}

const createDateFromParts = (dateParts) => {
  if (!Array.isArray(dateParts)) {
    throw new Error('dateParts must be an array')
  }
  if (dateParts.length !== 3) {
    throw new Error('dateParts must contain 3')
  }

  const day = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10)
  const year = parseInt(dateParts[2], 10)
  console.log(` day: ${day}, month: ${month}, year: ${year}`)

  const date = new Date(`${year}-${month}-${day}`)
  console.log('date before retuen ', date)

  return date
}

const dateToISOString = (date) => {
  console.log('date', date)
  if (!(date instanceof Date)) {
    throw new Error('date must be a Date object')
  }
  return date.toISOString()
}

const convertLocalDateToISO = (formattedDate) => {
  try {
    const dateParts = splitDateString(formattedDate)
    const dateObject = createDateFromParts(dateParts)
    return dateToISOString(dateObject)
  } catch (error) {
    console.error(error)
    return null
  }
}

// convert createdAt date to the format 2 November 2023
const convertDateToFormattedString = (dateValue) => {
  const date = new Date(dateValue)
  if (!(date instanceof Date)) {
    throw new Error('date must be a Date object')
  }
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-GB', options)
}

module.exports = {
  splitDateString,
  createDateFromParts,
  dateToISOString,
  convertLocalDateToISO,
  convertDateToFormattedString
}
