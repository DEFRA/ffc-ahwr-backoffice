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
When(/^I click the Claim tab$/, async () => {
  await  AgreementPage.clickClaimTabLink()
  await browser.pause(5000)
});
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


const doLogin = async () => {
  await LoginPage.enterEmail("a-livsey.williams@defra.onmicrosoft.com")
  await LoginPage.clickNext()
  await browser.pause(1000)
  await LoginPage.enterPassword('Toxteth26/')
  await LoginPage.clickSubmit()
}
const doSearch = async (agreementNumber) => {
  await ApplicationsPage.enterSearch(agreementNumber)
  await ApplicationsPage.clickSearchBtn()
}
const goToAgreementPage = async (agreementNumber,isLoggedIn) => {
  await LandingPage.open()
  await browser.pause(5000)
  if(isLoggedIn == false)
    await doLogin()
  await LandingPage.clickApplicationLink()
  await browser.pause(5000)
  await doSearch(agreementNumber)
  await browser.pause(1000)
  await ApplicationsPage.clickViewDetailsLink()
  await browser.pause(5000)

}




