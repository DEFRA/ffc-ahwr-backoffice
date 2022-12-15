const Page = require('./page')

class ApplicationsPage extends Page {


    get titleElement(){return browser.$("//h1[contains(@class,'govuk-heading-l')]")}
    get backLink(){return browser.$("//a[contains(@class,'govuk-back-link')]")}
    get accessibilityLink(){return browser.$("//a[@href='/accessibility']")}

    get agreementNumberHeader(){return browser.$("//th[@scope='col'][contains(.,'Agreement number')]")}
    get organisationHeader(){return browser.$("//th[@scope='col'][contains(.,'Organisation')]")}
    get sbiNumberHeader(){return browser.$("//button[@type='button'][contains(.,'SBI number')]")}
    get applyDateHeader(){return browser.$("//button[@type='button'][contains(.,'Apply date')]")}
    get statusHeader(){return browser.$("//button[@type='button'][contains(.,'Status')]")}
    get detailsHeader(){return browser.$("//th[@scope='col'][contains(.,'Details')]")}
    get searchTextField(){return browser.$("//input[@id='searchText']")}
    get searchBtn(){return browser.$("//button[@class='search-button'][contains(.,'Search')]")}
    get viewDetailsLink(){return browser.$("//a[contains(.,'View details')]")}
    get paginationLink(){return browser.$("//a[@class='govuk-link govuk-pagination__link'][contains(.,'1')]")}

    get firstOrganisationInList(){return browser.$("(//td[contains(@class,'govuk-table__cell')])[2]")}

    get firstCheckInInList(){return browser.$("(//span[@class='govuk-tag govuk-tag--grey'][contains(.,'IN CHECK')])[1]")}
    get firstReadyToPayInList(){return browser.$("(//span[@class='govuk-tag govuk-tag--grey'][contains(.,'READY TO PAY')])[1]")}
    get firstRejectedInList(){return browser.$("(//span[@class='govuk-tag govuk-tag--red'][contains(.,'REJECTED')])[1]")}
    get firstNotAgreedInList(){return browser.$("//span[@class='govuk-tag govuk-tag--red'][contains(.,'NOT AGREED')]")}
    get firstAgreedInList(){return browser.$("(//span[@class='govuk-tag govuk-tag--green'][contains(.,'AGREED')])[1]")}
    get firstClaimedInList(){return browser.$("(//span[@class='govuk-tag govuk-tag--blue'][contains(.,'CLAIMED')])[1]")}

    async enterSearch (value) {await (await this.searchTextField).setValue(value)}
    async clickSearchBtn () {await (await this.searchBtn).click()}
    async clickViewDetailsLink () {await (await this.viewDetailsLink).click()}
    async scrollToAccessibilityLink(){
        await (await this.accessibilityLink).scrollIntoView()
    }
    async scrollToBackLink(){
        await (await this.backLink).scrollIntoView()
    }
}

module.exports = new ApplicationsPage()
