const Page = require('./page')

class AgreementPage extends Page {

    get backLink(){return browser.$("//a[contains(.,'Back')]")}
    get agreementTitle(){return browser.$("//h1[contains(@class,'govuk-caption-l govuk-!-margin-bottom-3')]")}
    get agreementName(){return browser.$("(//dd[contains(@class,'govuk-summary-list__value')])[1]")}
    get agreementSBINumber(){return browser.$("(//dd[contains(@class,'govuk-summary-list__value')])[2]")}
    get agreementAddress(){return browser.$("(//dd[contains(@class,'govuk-summary-list__value')])[3]")}
    get agreementEmailAddress(){return browser.$("(//dd[contains(@class,'govuk-summary-list__value')])[4]")}

    get agreementTabLink(){return browser.$("//a[@href='#application']")}
    get agreementTabHeading(){return browser.$("(//h2[contains(@class,'govuk-heading-l')])[1]")}
    get agreementDate(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[1]")}
    get agreementBusinessDetailsCorrect(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[2]")}
    get agreementTypeOfReview(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[3]")}
    get agreementNumberOfLifeStock(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[4]")}
    get agreementAccepted(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[5]")}

    get claimTabHeading(){return browser.$("(//h2[contains(@class,'govuk-heading-l')])[2]")}
    get claimDateOfClaim(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[6]")}
    get claimReviewedDetailsConfirmed(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[7]")}
    get claimDateOfReview(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[8]")}
    get claimVetsName(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[9]")}
    get claimVetsRCVSNumber(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[10]")}
    get claimURN(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[11]")}

    get claimTabLink(){return browser.$("//a[@href='#claim']")}

   // get agreementName(){return browser.$("")}


    async clickBackLink () {await (await this.backLink).click()}
    async clickAgreementTabLink () {await (await this.agreementTabLink).click()}
    async clickClaimTabLink () {await (await this.claimTabLink).click()}
}

module.exports = new AgreementPage()
