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
  return { page, totalPages, total, limit, url }
}

module.exports = {
  getPagination,
  getPagingData
}
