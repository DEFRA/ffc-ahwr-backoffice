const { Given, When, Then } = require('@wdio/cucumber-framework')

const LandingPage = require('../page-objects/landing-page')
const LoginPage = require('../page-objects/login-page')
const ApplicationsPage = require('../page-objects/applications-page')
const AgreementPage = require('../page-objects/agreement-page')

Given('a claim has been submitted with agreement number {string}',async (agreementNumber) => {
  await goToAgreementPage(agreementNumber,false)
})
Given("I am on the view agreement page for agreement {string}", async (agreementNumber) =>{
  await goToAgreementPage(agreementNumber,true)
});
Given("I am on the AHWR page {string}",async (isLoggedIn)=>{
  if(isLoggedIn === 'true')
    await goTOAHWR(true)
  else
    await goTOAHWR(false)
})
Given("the application table is displayed",async ()=>{
  await validateTableHeaders()
})
//Given("",async ()=>{})
When(/^I click the Claim tab$/, async () => {
  await  AgreementPage.clickClaimTabLink()
  await browser.pause(5000)
});
When("I scroll up and around the AHWR page",async ()=>{
  await ApplicationsPage.scrollToAccessibilityLink();
  await browser.pause(3000)
  await ApplicationsPage.scrollToBackLink();
})
When("I enter the name {string} as the organisation in the search bar and press the search button",async (value)=>{
  await doSearch(value)
})
Then("the displayed data set's title should be {string}", async (value) =>{
  await wdioExpect(await AgreementPage.claimTabHeading).toHaveTextContaining(value)
});
Then("following data set {string} {string} {string} {string} {string} {string} should be displayed",async (reviewDetailsConfirmed,dateOfClaim, dateOfReview , vetName, vetRCVS,URN)=>{
  await wdioExpect(await AgreementPage.claimReviewedDetailsConfirmed).toHaveTextContaining(reviewDetailsConfirmed)
  await wdioExpect(await AgreementPage.claimDateOfClaim).toHaveTextContaining(dateOfClaim)
  await wdioExpect(await AgreementPage.claimDateOfReview).toHaveTextContaining(dateOfReview)
  await wdioExpect(await AgreementPage.claimVetsName).toHaveTextContaining(vetName)
  await wdioExpect(await AgreementPage.claimVetsRCVSNumber).toHaveTextContaining(vetRCVS)
  await wdioExpect(await AgreementPage.claimURN).toHaveTextContaining(URN)
})
Then("the page's title should be {string}",async (value)=>{
  await wdioExpect(await ApplicationsPage.titleElement).toHaveTextContaining(value)
})
Then("all other titles and content should display the correct information",async ()=>{
  await wdioExpect(await ApplicationsPage.titleElement).toBePresent()
  await wdioExpect(await ApplicationsPage.backLink).toBePresent()
  await validateTableHeaders()
  await wdioExpect(await ApplicationsPage.searchTextField).toBePresent()
  await wdioExpect(await ApplicationsPage.searchBtn).toBePresent()
  await ApplicationsPage.scrollToAccessibilityLink();
  await wdioExpect(await ApplicationsPage.accessibilityLink).toBePresent()
  await wdioExpect(await ApplicationsPage.paginationLink).toBePresent()
  await ApplicationsPage.scrollToBackLink();
})
Then("a list agreement should be displayed for the organisation {string}",async (value)=>{
  await browser.pause(20000)
  await wdioExpect(await ApplicationsPage.firstOrganisationInList).toHaveTextContaining(value)
})

const doLogin = async () => {
  await LoginPage.enterEmail("a-livsey.williams@defra.onmicrosoft.com")
  await LoginPage.clickNext()
  await browser.pause(1000)
  await LoginPage.enterPassword('Toxteth26/')
  await LoginPage.clickSubmit()
}
const goTOAHWR = async (isLoggedIn) => {
  await LandingPage.open()
  await browser.pause(5000)
  if(isLoggedIn === false)
    await doLogin()
  await LandingPage.clickApplicationLink()
  await browser.pause(5000)
}
const doSearch = async (value) => {
  await ApplicationsPage.enterSearch(value)
  await ApplicationsPage.clickSearchBtn()
}
const goToAgreementPage = async (agreementNumber,isLoggedIn) => {
  await goTOAHWR(isLoggedIn)
  await doSearch(agreementNumber)
  await browser.pause(1000)
  await ApplicationsPage.clickViewDetailsLink()
  await browser.pause(5000)

}
const validateTableHeaders = async () => {
  await wdioExpect(await ApplicationsPage.agreementNumberHeader).toBePresent()
  await wdioExpect(await ApplicationsPage.organisationHeader).toBePresent()
  await wdioExpect(await ApplicationsPage.sbiNumberHeader).toBePresent()
  await wdioExpect(await ApplicationsPage.applyDateHeader).toBePresent()
  await wdioExpect(await ApplicationsPage.statusHeader).toBePresent()
  await wdioExpect(await ApplicationsPage.detailsHeader).toBePresent()
}




Then("the status of each application should be displayed on AHWR pages", async ()=> {
  await doSearch("IN CHECK")
  await browser.pause(1000)
  await wdioExpect(await ApplicationsPage.firstCheckInInList).toBePresent()

  await doSearch("READY TO PAY")
  await browser.pause(1000)
  await wdioExpect(await ApplicationsPage.firstReadyToPayInList).toBePresent()

  await doSearch("REJECTED")
  await browser.pause(1000)
  await wdioExpect(await ApplicationsPage.firstRejectedInList).toBePresent()

  await doSearch("NOT AGREED")
  await browser.pause(1000)
  await wdioExpect(await ApplicationsPage.firstNotAgreedInList).toBePresent()

  await doSearch("AGREED")
  await browser.pause(1000)
  await wdioExpect(await ApplicationsPage.firstAgreedInList).toBePresent()

  await doSearch("CLAIMED")
  await browser.pause(1000)
  await wdioExpect(await ApplicationsPage.firstClaimedInList).toBePresent()
});
