/**
 * Get limit and offset on basis of page selected for querying data.
 * @param  {} page=1
 * @param  {} limit=10
 */
function getPagination (page = 1, limit = 10) {
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
  const previous = page === 1 ? null : { href: `${url}?page=${page - 1}` }
  const next = totalPages === 1 || totalPages === page ? null : { href: `${url}?page=${totalPages}` }
  const pages = totalPages === 1
    ? null
    : []

  if (pages) {
    for (let x = (page - 2); x <= (page + 2); x++) {
      if (x > 0 && x <= totalPages) {
        pages.push({
          number: x,
          current: x === page,
          href: `${url}?page=${x}`
        })
      }
    }
  }
  return { previous, next, pages }
}

module.exports = {
  getPagination,
  getPagingData
}
