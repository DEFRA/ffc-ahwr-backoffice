const { queryEntities } = require('./storage')

const getHistory = async (sbi, cph ) => {

  const partitionKey = `${sbi}_${cph}`

  const checkIfEntityExists = await queryEntities(partitionKey, rowKey)

  if (checkIfEntityExists.length > 0) {
    rowKey = `${raisedEvent.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }

}

module.exports = { getHistory }
