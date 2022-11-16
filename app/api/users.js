const downloadBlob = require('../lib/storage/download-blob')
const { usersContainer, usersFile } = require('../config').storageConfig

async function getUsers () {
  const contents = await downloadBlob(usersContainer, usersFile) ?? '[]'
  return JSON.parse(contents)
}

function sortUsers (direction, users) {
  return direction ? sort(direction, users) : users
}

function sort (direction, users) {
  return direction === 'ascending' ? sortAscending(users) : sortDescending(users)
}

function sortAscending (users) {
  return users.sort(function (a, b) {
    return parseFloat(b.sbi) - parseFloat(a.sbi)
  })
}

function sortDescending (users) {
  return users.sort(function (a, b) {
    return parseFloat(a.sbi) - parseFloat(b.sbi)
  })
}

function searchForUser (searchText, searchType, usersList) {
  searchText = searchText.toLowerCase()
  const filteredResults = []
  usersList.forEach(n => {
    switch (searchType) {
      case 'sbi':
        if (n.sbi === searchText) {
          filteredResults.push(n)
        }
        break
      case 'name':
        if (n.name === searchText) {
          filteredResults.push(n)
        }
        break
      case 'email':
        if (n.email.toLowerCase() === searchText) {
          filteredResults.push(n)
        }
        break
    }
  })
  return filteredResults
}

module.exports = {
  getUsers,
  sortUsers,
  searchForUser
}
