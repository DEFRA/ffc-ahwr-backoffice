const { Given, When, Then, And } = require('@wdio/cucumber-framework')
const BackOfficePage = require('../pages/back-office-page')
const backOfficePage = new BackOfficePage()

Given(/^the user is on the backoffice URL$/, async function () {
    await backOfficePage.getHomePage()
  })
When(/^clicks on application link$/, async function () {
  await backOfficePage.clickOnApplicationButton()
})

When(/^clicked on Claims tab$/, async function () {
  await backOfficePage.clickOnClaimTab()
})

When(/^clicked on Agreements tab$/, async function () {
  await backOfficePage.clickOnAgreementsTab()
})

When(/^user enters the (.*)$/, async function (crnNumber) {
  await backOfficePage.enterCRN(crnNumber)
})

When(/^search button is clicked$/, async function () {
  await backOfficePage.clickOnSearchButton()
})

Then(/^click on view claim$/,async function(){
  await backOfficePage.clickOnViewDetails()
}) 
Then(/^click on view claims$/,async function(){
  await backOfficePage.clickOnViewClaims()
}) 

When(/^select the checkboxes$/,async function(){
  await backOfficePage.clickOnCheckbox() 
})

Then(/^authorise the payment$/,async function(){
  await backOfficePage.clickOnAuthorisePayment() 
})

Then(/^click and continue$/,async function(){
  await backOfficePage.clickOnConfirm() 
})

When(/^click withdraw$/,async function(){
  await backOfficePage.clickOnWithDraw() 
})

Then(/^confirm withdraw$/,async function(){
  await backOfficePage.clickOnConfirm() 
})

Then(/^confirm not to withdraw$/,async function(){
  await backOfficePage.clickOnConfirmNotToWithdraw() 
})

Then(/^verify error message in claims tab$/,async function(){
  await backOfficePage.claimNotFound() 
})
Then(/^verify error message in agreements tab$/,async function(){
  await backOfficePage.agreementNotFound() 
})

Then(/^Recomment to Pay$/,async function(){
  await backOfficePage.recommendToPay()
})

Then(/^Recomment to Reject$/,async function(){
  await backOfficePage.recommendToReject()
})


Then(/^confirm payment$/,async function(){
  await backOfficePage.clickonPaymentConfirm()
})

Then(/^enter email credentials$/,async function(){
  await backOfficePage.emailCredentials()
})

Then(/^Click Back$/,async function(){
  await backOfficePage.clickonBack()
}) 
When(/^check if History is present$/, async function () {
  await backOfficePage.clickhistoryTab()
})
When(/^click om Agreements View Details Tab$/, async function () {
  await backOfficePage.clickAgreementsViewDetailsTab()
})
When(/^validate the (.*) in the header$/, async function (number) {
  await backOfficePage.validateHeaderValue(number)
})
When(/^validate the back to all claims functionality$/, async function () {
  await backOfficePage.clickBackToAllClaims()
})
When(/^validate the business link functionality$/, async function () {
  await backOfficePage.clickBusiness()
})
