const config = require('./config')
const Hapi = require('@hapi/hapi')
const catbox = config.useRedis ? require('@hapi/catbox-redis') : require('@hapi/catbox-memory')
const cacheConfig = config.useRedis ? config.cache.options : {}

async function createServer () {
  const server = Hapi.server({
    cache: [{
      provider: {
        constructor: catbox,
        options: cacheConfig
      }
    }],
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register(require('./plugins/auth'))
  await server.register(require('@hapi/crumb'))
  await server.register(require('@hapi/inert'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/session'))
  await server.register(require('./plugins/cookies'))
  await server.register(require('./plugins/error-pages'))
  await server.register(require('./plugins/logging'))

  if (config.isDev) {
    await server.register(require('blipp'))
  }

  return server
}

module.exports = createServer
