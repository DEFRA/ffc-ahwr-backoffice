const { getPagination, getPagingData } = require('../../pagination')
const { getAppSearch } = require('../../session')
const usersFile = require('../../constants/users')

class UsersViewModel {
  constructor (request) {
    return (async () => {
      this.model = await createModel(request)
      return this
    })()
  }
}

const getUsersTableHeader = () => {
  const headerColumns = [{
    text: 'Farmer Name'
  },
  {
    text: 'Organisation'
  },
  {
    text: 'SBI'
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
  const users = usersFile.map(n => {
    return [
      {
        "text" : n.farmerName,
      },
      {
        "text" : n.name
      },
      {
        "text" : n.sbi,
        format: 'numeric',
        attributes: {
          'data-sort-value': n.sbi
        }
      },
      {
        "text" : n.cph,
        format: 'numeric',
        attributes: {
          'data-sort-value': n.cph
        }
      },
      {
        "text" : n.address
      },
      {
        "text" : n.email
      }
    ]
  })
  return {
      users,
      header: getUsersTableHeader()
  }
}

module.exports = { UsersViewModel, getUsersTableHeader }
