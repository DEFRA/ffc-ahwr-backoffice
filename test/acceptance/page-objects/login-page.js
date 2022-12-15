const Page = require('./page')
class LoginPage extends Page {
    get emailTextBox() {return browser.$("//input[contains(@name,'loginfmt')]")}
    get nextBtn(){ return browser.$("//input[contains(@value,'Next')]")}
    get passTextBox() {return browser.$("//input[contains(@name,'passwd')]")}
    get submitBtn(){ return browser.$("//input[contains(@value,'Sign in')]")}

    async enterEmail (email) {await (await this.emailTextBox).setValue(email)}
    async enterPassword (value) {await (await this.passTextBox).setValue(value)}
    async clickNext () {await (await this.nextBtn).click()}
    async clickSubmit () {await (await this.submitBtn).click()}
}
module.exports = new LoginPage()
