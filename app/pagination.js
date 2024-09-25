const { displayPageSize } = require('./config')
const { generateQueryString } = require('./routes/utils/generate-query-string')

/**
 * Get limit and offset on basis of page selected for querying data.
 * @param  {} page=1
 * @param  {} limit=20
 */
function getPagination (page = 1, limit = displayPageSize) {
  const offset = page === 1 ? 0 : (page - 1) * limit
  return { limit, offset }
}
/**
 * Get Paging Data to display pageination UI.
 * @param  int total
 * @param  int limit
 * @param  int page
 * @param  Url url
 */

function getPagingData (total, limit, page, query) {
  const queryString = generateQueryString(query, ['page'])
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
