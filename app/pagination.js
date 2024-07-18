const { displayPageSize } = require('./config')

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

function getPagingData (total, limit, page, url) {
  const totalPages = Math.ceil(total / limit)
  const previous = Number(page) === 1 ? null : { href: `${url}?page=${Number(page) - 1}` }
  const next = totalPages === 1 || totalPages === Number(page) ? null : { href: `${url}?page=${Number(page) + 1}` }
  const pages = totalPages === 1
    ? null
    : []

  if (pages) {
    for (let x = (page - 2); x <= (page + 2); x++) {
      if (x > 0 && x <= totalPages) {
        pages.push({
          number: x,
          current: x === Number(page),
          href: `${url}?page=${x}`
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
