const keys = require('../../session/keys')
const { getUserSearch } = require('../../session')
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
    text: 'SBI number',
    attributes: {
      'aria-sort': sortField && sortField.field === 'SBI' ? direction : 'none',
      'data-url': '/users/sort/SBI'
    },
    format: 'numeric'
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
  const sortField = getUserSearch(request, keys.userSearch.sort) ?? undefined
  const direction = sortField && sortField.direction === 'DESC' ? 'descending' : 'ascending'
  const searchText = getUserSearch(request, keys.userSearch.searchText) ?? undefined
  const searchType = getUserSearch(request, keys.userSearch.searchType) ?? undefined

  const filteredUsers = searchText ? searchForUser(searchText, searchType) : usersList

  const sortedUsers = sortUsers(direction, filteredUsers)

  if (sortedUsers.length > 0) {
    const users = sortedUsers.map(n => {
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
      header: getUsersTableHeader(getUserSearch(request, keys.userSearch.sort))
    }
  } else {
    return {
      users: [],
      error: 'No Users found.',
      searchText
    }
  }
}

module.exports = { UsersViewModel, getUsersTableHeader }
