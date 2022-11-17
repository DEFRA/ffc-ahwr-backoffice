const { usersContainer, usersFile } = require('../../../../app/config').storageConfig

describe('Get users', () => {
  let downloadBlobMock
  let getUsers
  let sortUsers
  let searchForUser

  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModules()

    downloadBlobMock = require('../../../../app/lib/storage/download-blob')
    jest.mock('../../../../app/lib/storage/download-blob')

    const users = require('../../../../app/api/users')
    getUsers = users.getUsers
    sortUsers = users.sortUsers
    searchForUser = users.searchForUser
  })

  test('makes request to download users blob', async () => {
    await getUsers()

    expect(downloadBlobMock).toHaveBeenCalledTimes(1)
    expect(downloadBlobMock).toHaveBeenCalledWith(usersContainer, usersFile)
  })

  test.each([
    { fileContent: null },
    { fileContent: undefined }
  ])('return undefined when blob content is $fileContent', async ({ fileContent }) => {
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getUsers()

    expect(res).toEqual([])
  })

  test('return user data', async () => {
    const fileContent = '[{ "email": "a@b.com" }]'
    downloadBlobMock.mockResolvedValue(fileContent)
    const res = await getUsers()
    expect(res).toEqual(JSON.parse(fileContent))
  })

  test('return user data', async () => {
    const fileContent = '[{ "email": "a@b.com" }]'
    downloadBlobMock.mockResolvedValue(fileContent)
    const res = await getUsers()
    expect(res).toEqual(JSON.parse(fileContent))
  })

  test('sort users ascending', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100"}, { "email": "b@a.com", "sbi": "300"}, { "email": "c@d.com", "sbi": "50"}]')
    const res = await sortUsers('ascending', users)
    expect(res[0]).toEqual(JSON.parse('{"email": "c@d.com", "sbi": "50"}'))
  })

  test('sort users descending', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100"}, { "email": "b@a.com", "sbi": "300"}, { "email": "c@d.com", "sbi": "50"}]')
    const res = await sortUsers('descending', users)
    expect(res[0]).toEqual(JSON.parse('{"email": "b@a.com", "sbi": "300"}'))
  })

  test('sort direction not matched and returns original', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100"}, { "email": "b@a.com", "sbi": "300"}, { "email": "c@d.com", "sbi": "50"}]')
    const res = await sortUsers(undefined, users)
    expect(res).toEqual(users)
  })

  test('search for user by sbi exists', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100"}, { "email": "b@a.com", "sbi": "300"}, { "email": "c@d.com", "sbi": "50"}]')
    const res = await searchForUser('100', 'sbi', users)
    expect(res).toHaveLength(1)
  })

  test('search for user by non existent sbi', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100"}, { "email": "b@a.com", "sbi": "300"}, { "email": "c@d.com", "sbi": "50"}]')
    const res = await searchForUser('33333', 'sbi', users)
    expect(res).toHaveLength(0)
  })

  test('search for user by organisation name', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100", "name" : "The Dairy Ltd"}, { "email": "b@a.com", "sbi": "300", "name" : "The Cow Ltd"}, { "email": "c@d.com", "sbi": "50", "name" : "The Pig Ltd"}]')
    const res = await searchForUser('The Dairy Ltd', 'name', users)
    expect(res).toHaveLength(1)
  })

  test('search for user by non existent organisation name', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100", "name" : "The Dairy Ltd"}, { "email": "b@a.com", "sbi": "300", "name" : "The Cow Ltd"}, { "email": "c@d.com", "sbi": "50", "name" : "The Pig Ltd"}]')
    const res = await searchForUser('unknown', 'name', users)
    expect(res).toHaveLength(0)
  })

  test('search for user by email', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100", "name" : "The Dairy Ltd"}, { "email": "b@a.com", "sbi": "300", "name" : "The Cow Ltd"}, { "email": "c@d.com", "sbi": "50", "name" : "The Pig Ltd"}]')
    const res = await searchForUser('a@b.com', 'email', users)
    expect(res).toHaveLength(1)
  })

  test('search for user by non existent email', async () => {
    const users = JSON.parse('[{ "email": "a@b.com", "sbi": "100", "name" : "The Dairy Ltd"}, { "email": "b@a.com", "sbi": "300", "name" : "The Cow Ltd"}, { "email": "c@d.com", "sbi": "50", "name" : "The Pig Ltd"}]')
    const res = await searchForUser('wrong@email.com', 'email', users)
    expect(res).toHaveLength(0)
  })
})
