const browserstack = require('browserstack-local')
const allureReporter = require('@wdio/allure-reporter')
const timeStamp = new Date().toLocaleString()
const envRoot = (process.env.TEST_ENVIRONMENT_ROOT_URL || 'http://host.docker.internal:3004')
const chromeArgs = process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : []
const maxInstances = process.env.MAX_INSTANCES ? Number(process.env.MAX_INSTANCES) : 5
const user = process.env.BROWSERSTACK_USERNAME
const key = process.env.BROWSERSTACK_ACCESS_KEY
const parallel = process.env.BROWSERSTACK_PARALLEL_RUNS ? Number(process.env.BROWSERSTACK_PARALLEL_RUNS) : 1
const automationEnabled = process.env.FFC_AHWR_AUTOMATION_ENABLED

exports.config = {
  hostname: 'hub-cloud.browserstack.com',
  user,
  key,
  specs: ['./features/**/*.feature'],
  parallel,
  maxInstances,
  capabilities: [
    {
      'bstack:options': {
        os: 'Windows',
        'projectName': 'DEFRA/ffc-ahwr/Vet-Visit',
        osVersion: '10',
        browserVersion: '112.0',
        browserName: 'Chrome',
        'buildName': 'Chrome 112 compatibility - ' + timeStamp,
        local: true,
        networkLogs: true,
        seleniumVersion: '3.14.0',
        userName: user,
        accessKey: key
      },
      // chrome
      maxInstances,
      acceptInsecureCerts: true,
      'google:chromeOptions': {
        args: chromeArgs
      }
    },
    //
    // {
    //   // firefox 112
    //   os: 'Windows',
    //   osVersion: '10',
    //   'buildName': 'Firefox 112 compatibility - ' + timeStamp,
    //   'projectName': 'DEFRA/ffc-ahwr/Vet-Visit',
    //   browserVersion: '112',
    //   browserName: 'Firefox',
    //   'debug': true,
    //   'networkLogs': true,
    //   'video': true,
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true
    // },
    //
    // {
    //   // Windows Edge 112
    //   os: 'Windows',
    //   osVersion: '10',
    //   'buildName': 'Edge 112 compatibility - ' + timeStamp,
    //   'projectName': 'DEFRA/ffc-ahwr/Vet-Visit',
    //   browserVersion: '112',
    //   browserName: 'Edge',
    //   'browserstack.local': true,
    //   'debug': true,
    //   'networkLogs': true,
    //   'video': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true,
    //   'browserstack.selenium_version': '4.0.0-alpha-6'
    // },
    //
    // {
    //   // Chrome 111
    //   os: 'Windows',
    //   osVersion: '10',
    //   'buildName': 'Chrome 111 compatibility - ' + timeStamp,
    //   'projectName': 'DEFRA/ffc-ahwr/Vet-Visit',
    //   browserVersion: '111',
    //   browserName: 'Chrome',
    //   'browserstack.local': true,
    //   'debug': true,
    //   'networkLogs': true,
    //   'video': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true,
    //   'browserstack.selenium_version': '4.0.0-alpha-6'
    // },
    //
    // {
    //   // firefox 111
    //   os: 'Windows',
    //   osVersion: '10',
    //   'buildName': 'Firefox 111 compatibility - ' + timeStamp,
    //   'projectName': 'DEFRA/ffc-ahwr/Vet-Visit',
    //   browserVersion: '111',
    //   browserName: 'Firefox',
    //   'debug': true,
    //   'networkLogs': true,
    //   'video': true,
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true
    // },
    //
    // {
    //   // Windows Edge 111
    //   os: 'Windows',
    //   osVersion: '10',
    //   'buildName': 'Edge 111 compatibility - ' + timeStamp,
    //   'projectName': 'DEFRA/ffc-ahwr/Vet-Visit',
    //   browserVersion: '111',
    //   browserName: 'Edge',
    //   'browserstack.local': true,
    //   'debug': true,
    //   'networkLogs': true,
    //   'video': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true,
    //   'browserstack.selenium_version': '4.0.0-alpha-6'
    // },
    //

    // {
    //   // firefox 111
    //   os: 'Windows',
    //   osVersion: '10',
    //   browserName: 'Firefox',
    //   browserVersion: '111',
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true
    // }

    // {
    //   // Windows Edge 111
    //   os: 'Windows',
    //   osVersion: '10',
    //   browserName: 'Edge',
    //   browserVersion: '111',
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true,
    //   'browserstack.selenium_version': '4.0.0-alpha-6'
    // },
    // {
    //   // Windows Edge 111
    //   os: 'Windows',
    //   osVersion: '10',
    //   browserName: 'chrome',
    //   browserVersion: '111',
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true,
    //   'browserstack.selenium_version': '4.0.0-alpha-6'
    // }

    // ,
    // {
    //   os: 'OS X',
    //   osVersion: 'Big Sur',
    //   browserName: 'Safari',
    //   browserVersion: 'latest',
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true
    // },

    // {
    //   // Windows IE 11
    //   os: 'Windows',
    //   osVersion: '10',
    //   browserName: 'IE',
    //   browserVersion: '11',
    //   resolution: '1024x768',
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true
    // },

    // {
    //   // Windows Edge 86
    //   os: 'Windows',
    //   osVersion: '10',
    //   browserName: 'Edge',
    //   browserVersion: '86',
    //   'browserstack.local': true,
    //   acceptInsecureCerts: true,
    //   acceptSslCerts: true,
    //   'browserstack.selenium_version': '4.0.0-alpha-6'
    // }
  ],
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  logLevel: 'info',
  bail: 0,
  baseUrl: envRoot,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 1,
  services: ['browserstack'],
  framework: 'cucumber',
  specFileRetries: 0,
  specFileRetriesDelay: 30,
  // reporters: ['spec',
  //   [HtmlReporter, {
  //     debug: false,
  //     outputDir: './html-reports/',
  //     filename: 'feature-report.html',
  //     reportTitle: 'Feature Test Report',
  //     showInBrowser: false,
  //     useOnAfterCommandForScreenshot: false,
  //     LOG: logger
  //   }]
 // ],
  // If you are using Cucumber you need to specify the location of your step definitions.
  cucumberOpts: {
    require: ['./steps/**/*.js'], // <string[]> (file/dir) require files before executing features
    backtrace: false, // <boolean> show full backtrace for errors
    requireModule: ['@babel/register'], // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    dryRun: false, // <boolean> invoke formatters without executing steps
    failFast: false, // <boolean> abort the run on first failure
    format: ['pretty'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    colors: true, // <boolean> disable colors in formatter output
    snippets: true, // <boolean> hide step definition snippets for pending steps
    source: true, // <boolean> hide source uris
    profile: [], // <string[]> (name) specify the profile to use
    strict: false, // <boolean> fail if there are any undefined or pending steps
    tagExpression: '', // <string> (expression) only execute the features or scenarios with tags matching the expression
    timeout: 60000, // <number> timeout for step definitions
    ignoreUndefinedDefinitions: false // <boolean> Enable this config to treat undefined definitions as warnings.
  },
  // ====
  // Hooks
  // =====
  onPrepare: function (config, capabilities) {
    if (automationEnabled === 'false') {
      console.log('Automation tests disable, exiting tests.')
      process.exit(0)
    }
    const reportAggregator = new ReportAggregator({
      outputDir: './html-reports/',
      filename: 'acceptance-test-suite-report.html',
      reportTitle: 'Acceptance Tests Report',
      browserName: capabilities.browserName
    })
    reportAggregator.clean()
    global.reportAggregator = reportAggregator
    console.log('Connecting local')
    return new Promise(function (resolve, reject) {
      exports.bs_local = new browserstack.Local()
      const bsLocalArgs = {
        key,
        verbose: 'true',
        onlyAutomate: 'true'
      }
      exports.bs_local.start(bsLocalArgs, function (error) {
        if (error) return reject(error)
        console.log('Connected. Now testing...')
        resolve()
      })
    })
  },

  onComplete: function (exitCode, config, capabilities, results) {
    (async () => {
      await global.reportAggregator.createReport()
    })()
    exports.bs_local.stop()
    console.log('Testing complete, binary closed')
  },

  beforeSession: function () {
    const chai = require('chai')
    global.expect = chai.expect
    global.assert = chai.assert
    global.should = chai.should()
  },

  afterStep: function (featureName, feature, result, ctx) {
    if (result.passed) {
      return
    }
    const path = require('path')
    const moment = require('moment')
    const screenshotFileName = ctx.uri.split('.feature')[0].split('/').slice(-1)[0]
    const timestamp = moment().format('YYYYMMDD-HHmmss.SSS')
    const filepath = path.join('./html-reports/screenshots/', screenshotFileName + '-' + timestamp + '.png')
    browser.saveScreenshot(filepath)
    process.emit('test:screenshot', filepath)
  },

  beforeFeature: async function (uri, feature) {
    allureReporter.addStep('Starting Fetaure : ' + feature.name)
    await browser.maximizeWindow()
  },
  beforeScenario: async function (world) {
    await allureReporter.addFeature(world.name)
  },
  afterStep: async function (step, scenario, result) {
    cucumberJson.attach(await browser.takeScreenshot(), 'image/png')
  }
}
