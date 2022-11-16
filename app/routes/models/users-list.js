const keys = require('../../session/keys')
const { getAppSearch } = require('../../session')
const { usersList, sortUsers, searchForUser } = require('../../api/users')

class UsersViewModel {
  constructor (request) {
    return (async () => {
      this.model = await createModel(request)
      return this
    })()
  }
}

const getUsersTableHeader = (sortField) => {
  const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'
  const headerColumns = [{
    text: 'Farmer Name'
  },
  {
    text: 'Organisation'
  },
  {
    text: 'SBI',
    attributes: {
      'aria-sort': sortField && sortField.field === 'SBI' ? direction : 'none',
      'data-url': '/users/sort/SBI'
    }
  },
  {
    text: 'CPH'
  },
  {
    text: 'Address'
  },
  {
    text: 'Email'
  }]

  return headerColumns
}

async function createModel (request) {
  const sortField = getAppSearch(request, keys.appSearch.sort) ?? undefined
  const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'
  const searchText = getAppSearch(request, keys.appSearch.searchText) ?? undefined
  const searchType = getAppSearch(request, keys.appSearch.searchType) ?? undefined

  sortUsers(direction)

  const filteredUsers = searchText ? searchForUser(searchText, searchType) : usersList

  const users = filteredUsers.map(n => {
    return [
      {
        text: n.farmerName
      },
      {
        text: n.name
      },
      {
        text: n.sbi,
        format: 'numeric',
        attributes: {
          'data-sort-value': n.sbi
        }
      },
      {
        text: n.cph,
        format: 'numeric'
      },
      {
        text: n.address
      },
      {
        text: n.email,
        format: 'email'
      }
    ]
  })
  return {
    users,
    header: getUsersTableHeader(getAppSearch(request, keys.appSearch.sort))
  }
}

module.exports = { UsersViewModel, getUsersTableHeader }
