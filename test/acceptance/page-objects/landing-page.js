const Page = require('./page')

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LandingPage extends Page {
  get applicationLink() {return browser.$("//a[@href='/applications']")}

  open () {
    return super.open('/')
  }

  async clickApplicationLink () {await (await this.applicationLink).click()}

}

module.exports = new LandingPage()
