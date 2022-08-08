const path = require('path')
const nunjucks = require('nunjucks')
const { isLocal, serviceName, siteTitle } = require('../config')
const { version } = require('../../package.json')

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          const nunjucksAppEnv = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/',
            'node_modules/@ministryofjustice/frontend/'
          ], {
            autoescape: true,
            watch: false
          })

          // Add filters from MOJ Frontend
          let mojFilters = require('../../node_modules/@ministryofjustice/frontend/moj/filters/all')()
          mojFilters = Object.assign(mojFilters)
          Object.keys(mojFilters).forEach(function (filterName) {
            nunjucksAppEnv.addFilter(filterName, mojFilters[filterName])
          })

          options.compileOptions.environment = nunjucksAppEnv
          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: !isLocal,
    context: {
      appVersion: version,
      assetPath: '/assets',
      pageTitle: serviceName,
      siteTitle,
      serviceName
    }
  }
}
