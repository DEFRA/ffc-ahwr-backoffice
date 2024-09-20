const generateQueryString = (query, paramsToRemove = []) => {
    paramsToRemove.forEach((param) => {
        delete query[`${param}`]
    })

    let queryString = ''
    Object.entries(query).forEach(([k, v], i) => {
        queryString += `&${k}=${v}`
    })

    return queryString
}

module.exports = {
    generateQueryString
}
