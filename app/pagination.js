const { displayPageSize } = require('./config')
const querystring = require('node:querystring')

function getPagination (page = 1, limit = displayPageSize) {
  const offset = page === 1 ? 0 : (page - 1) * limit
  return { limit, offset }
}

function getPagingData (total, limit, query) {
  const { page, ...rest } = query;
  const queryString = Object.keys(rest).length
    ? `&${querystring.stringify(rest)}`
    : ''

  const totalPages = Math.ceil(total / limit)
  const previous = Number(page) === 1 ? null : { href: `?page=${Number(page) - 1}${queryString}` }
  const next = totalPages === 1 || totalPages === Number(page) ? null : { href: `?page=${Number(page) + 1}${queryString}` }
  const pages = totalPages === 1
    ? null
    : []

  if (pages) {
    for (let x = (page - 2); x <= (page + 2); x++) {
      if (x > 0 && x <= totalPages) {
        pages.push({
          number: x,
          current: x === Number(page),
          href: `?page=${x}${queryString}`
        })
      }
    }
  }

  return { previous, next, pages }
}

module.exports = {
  getPagination,
  getPagingData,
  displayPageSize
}
