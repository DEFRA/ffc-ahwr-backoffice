module.exports = {
  plugin: require('hapi-pino'),
  options: {
    level: 'warn',
    logPayload: true,
    logQueryParams: true,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
}
