const { Given, When, Then, And } = require('@wdio/cucumber-framework')
const BackOfficePage = require('../pages/back-office-page')
const backOfficePage = new BackOfficePage()

Given(/^the user is on the backoffice URL$/, async function () {
    await backOfficePage.getHomePage()
  })
When(/^clicks on application link$/, async function () {

  await backOfficePage.clickOnApplicationButton()
})
When(/^user enters the (.*)$/, async function (AgreementNumber) {
  await backOfficePage.enterAgreementNumber(AgreementNumber)
})

When(/^search button is clicked$/, async function () {
  await backOfficePage.clickOnSearchButton()
})

Then(/^click on view application$/,async function(){
  await backOfficePage.clickOnViewDetails()
}) 

Then(/^click on incheck button$/,async function(){
  await backOfficePage.clickOnIncheckButton()
})

Then(/^verify RecommendToPay button$/,async function(){
  await backOfficePage.isElementRecommedToPayButtonExist()
})

Then(/^verify RecommendToReject button$/,async function(){
  await backOfficePage.isElementRecommendToRejectButtonExist()
})

Then(/^verify and click move claim to incheck button$/,async function(){
  await backOfficePage.isElementIncheckButtonExist()
})

Then(/^validate the incheck text$/,async function(){
  await backOfficePage.isElementIncheckExist()
})

When(/^click on claim tab$/,async function(){
  await backOfficePage.clickOnClaimTab()
})

When(/^click on history tab$/,async function(){
  await backOfficePage.clickOnHistoryTab()
})

When(/^select the checkboxes$/,async function(){
  await backOfficePage.clickOnCheckbox() 
})
Then(/^verify details available$/,async function(){
  await backOfficePage.checkDetailsHistory()
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

Then(/^verify error message$/,async function(){
  await backOfficePage.applicationNotFound() 
})

Then(/^verify error message to select checkboxes$/,async function(){
  await backOfficePage.checkboxNotSelected()
})

Then(/^click on Recommend to Pay$/,async function(){
  await backOfficePage.recommendToPay()
})

Then(/^click on Recommend to Reject$/,async function(){
  await backOfficePage.recommendToReject()
})

Then(/^click on confirm and continue for incheck$/,async function(){
  await backOfficePage.clickOnConfirmAndContinueIncheck()
})
Then(/^click on confirm and continue for recommend$/,async function(){
  await backOfficePage.clickOnConfirmAndContinueRecommend()
})

Then(/^click on confirm and continue for authorise$/,async function(){
  await backOfficePage.clickOnConfirmAndContinueAuthorise()
})

Then(/^click on confirm and continue for reject claim$/,async function(){
  await backOfficePage.clickOnConfirmAndContinueRejectClaim()
})
Then(/^validate the Recommended to Pay text$/,async function(){
  await backOfficePage.isElementRecommendedToPayExist()
})
Then(/^validate the Recommended to Reject text$/,async function(){
  await backOfficePage.isElementRecommendedToRejectExist()
  })
Then(/^validate the Ready to Pay text$/,async function(){
  await backOfficePage.isElementReadyToPayExist()
})
Then(/^validate the Rejected text$/,async function(){
  await backOfficePage.isElementRejectedExist()
})
Then(/^confirm payment$/,async function(){
  await backOfficePage.clickonPaymentConfirm()
})

Then(/^enter email credentials$/,async function(){
  await backOfficePage.emailCredentials()
})

Then(/^click Back$/,async function(){
  await backOfficePage.clickonBack()
}) 