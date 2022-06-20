function getPagination (page = 1, limit = 10) {
  const offset = page === 1 ? 0 : (page - 1) * limit
  return { limit, offset }
}

function getPagingData (total, limit, page, url) {
  const totalPages = Math.ceil(total / limit)
  return { page, totalPages, total, limit, url }
}

module.exports = {
  getPagination,
  getPagingData
}
