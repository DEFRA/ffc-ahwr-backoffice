const { Given, When, Then } = require('@wdio/cucumber-framework')
const SelectBusinessPage = require('../pages/back-office-page')
const selectBusinessPage = new SelectBusinessPage()

Given(/^the user is on the (.*) page$/, async function (page) {
  await selectBusinessPage.getHomePage(page)
})
When(/^user start the application$/, async function () {
  await selectBusinessPage.clickOnStartButton()
})
When(/^user login with (.*) business crn and password\(for DefraId\)$/, async function (business) {
  await selectBusinessPage.signInWithDefraId(business)
});
When(/^select the (.*) for application$/, async function (businessName) {
  await selectBusinessPage.clickOnBusiness(businessName)
});
When(/^click on continue button$/, async function () {
  await selectBusinessPage.clickOnContinue()
});
// org-review
When(/^user check the business details$/, async function () {
  await selectBusinessPage.singleUserBusinessDetail()
})
When(/^user confirm the org-review page$/, async function () {
  await selectBusinessPage.checkFarmerDetails()
})
When(/^user agreed the business details is correct$/, async function () {
  await selectBusinessPage.farmerAcceptDetails()
})
Then(/^user continue to next page$/, async function () {
  await selectBusinessPage.proceedWithApplication()
})
// SELECT LIVESTOCK
When(/^user is on the livestock page$/, async function () {
  await selectBusinessPage.livestockPage()
})
When(/^user check if livestock are listed$/, async function () {
  await selectBusinessPage.livestockList()
})
When(/^user choose (.*) cattle for review$/, async function (LiveStockName) {
  await selectBusinessPage.liveStockReview(LiveStockName)
})
Then(/^User continue the application$/, async function () {
  await selectBusinessPage.continueTheApplication()
})
// ANIMAL ELIGIBILITY
When(/^user check the minimum number of livestock required to qualify for the review$/, async function () {
  await selectBusinessPage.minimumRequirement()
})
When(/^user confirm to meet the requirement$/, async function () {
  await selectBusinessPage.accurateLivestockNumber()
})
When(/^user continue the application$/, async function () {
  await selectBusinessPage.next()
})

Then(/^user check the answer$/, async function () {
  await selectBusinessPage.checkAnswerToBeAccurate()
  await selectBusinessPage.goToDeclaration()
})
// DECLARATION PAGE
When(/^user is on the declaration page$/, async function () {
  await selectBusinessPage.declarationUrl()
})
When(/^user view the page title$/, async function () {
  await selectBusinessPage.agreementReview()
})
When(/^user read through the full terms and conditions$/, async function () {
  await selectBusinessPage.conditionTab()
})
When(/^user accept the terms and conditions$/, async function () {
  await selectBusinessPage.termsAndConditionTitle()
  await selectBusinessPage.agreeToTerms()
})
Then(/^user complete the application$/, async function () {
  await selectBusinessPage.termsCheckBox()
  await selectBusinessPage.applicationCompleted()
})
Then(/^user should see successful message$/, async function () {
  await selectBusinessPage.successfulMessage()
})

